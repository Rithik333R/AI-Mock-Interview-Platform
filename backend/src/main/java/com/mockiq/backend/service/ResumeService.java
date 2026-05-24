package com.mockiq.backend.service;

import com.mockiq.backend.dto.response.ResumeResponse;
import com.mockiq.backend.entity.Resume;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.exception.BadRequestException;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * ResumeService — orchestrates the full resume feature.
 *
 * Upload flow:
 *   1. Check user hasn't exceeded resume limit
 *   2. Extract text from file (local, before upload)
 *   3. Upload file to Cloudinary
 *   4. Save Resume entity to DB
 *
 * Why extract text BEFORE uploading?
 *   If text extraction fails (corrupt file), we don't waste
 *   a Cloudinary upload. Fail fast and cheap.
 *
 * Why @Transactional on upload?
 *   If the DB save fails after a successful Cloudinary upload,
 *   we'd have an orphaned file in Cloudinary. The try/catch
 *   handles this by attempting to clean up Cloudinary on failure.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository    resumeRepository;
    private final FileStorageService  fileStorageService;
    private final ResumeParserService resumeParserService;
    private final UserService         userService;

    // Max resumes per user — simple guard for the free tier
    private static final long MAX_RESUMES_PER_USER = 5;

    /**
     * Upload a resume file, extract its text, and save to DB.
     */
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file) {

        User currentUser = userService.getCurrentUser();

        // 1. Enforce upload limit
        long existingCount = resumeRepository.countByUserAndIsActiveTrue(currentUser);
        if (existingCount >= MAX_RESUMES_PER_USER) {
            throw new BadRequestException(
                    "You have reached the maximum limit of "
                            + MAX_RESUMES_PER_USER + " resumes. "
                            + "Please delete an existing resume before uploading a new one.");
        }

        // 2. Extract text first (cheap — fails fast on corrupt files)
        String extractedText = resumeParserService.extractText(file);

        if (extractedText.isBlank()) {
            throw new BadRequestException(
                    "Could not extract any text from the file. "
                            + "Please ensure the file contains readable text, "
                            + "not just images or scanned content.");
        }

        // 3. Upload to Cloudinary
        FileStorageService.UploadResult uploadResult =
                fileStorageService.uploadResume(file);

        // 4. Determine a clean file type label
        String fileType = resolveFileType(file.getContentType());

        // 5. Build and save the Resume entity
        try {
            Resume resume = Resume.builder()
                    .user(currentUser)
                    .originalFileName(file.getOriginalFilename())
                    .cloudinaryPublicId(uploadResult.publicId())
                    .fileUrl(uploadResult.secureUrl())
                    .fileType(fileType)
                    .extractedText(extractedText)
                    .isActive(true)
                    .build();

            Resume saved = resumeRepository.save(resume);
            log.info("Resume saved for user [{}]: id={}", currentUser.getEmail(), saved.getId());

            return ResumeResponse.fromEntity(saved);

        } catch (Exception e) {
            // DB save failed — clean up the Cloudinary file to avoid orphans
            log.error("DB save failed after Cloudinary upload. Cleaning up: {}",
                    uploadResult.publicId());
            fileStorageService.deleteFile(uploadResult.publicId());
            throw new BadRequestException("Failed to save resume. Please try again.");
        }
    }

    /**
     * Get all active resumes for the current user.
     */
    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes() {
        User currentUser = userService.getCurrentUser();
        return resumeRepository
                .findByUserAndIsActiveTrueOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(ResumeResponse::fromEntity)
                .toList();
    }

    /**
     * Get one resume by ID — only if it belongs to the current user.
     */
    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(Long id) {
        User currentUser = userService.getCurrentUser();
        Resume resume = resumeRepository
                .findByIdAndUserAndIsActiveTrue(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume", "id", id));
        return ResumeResponse.fromEntity(resume);
    }

    /**
     * Soft-delete a resume — marks isActive = false.
     * The file stays in Cloudinary and the row stays in the DB.
     * Hard delete (with Cloudinary cleanup) can be a future admin feature.
     */
    @Transactional
    public void deleteResume(Long id) {
        User currentUser = userService.getCurrentUser();
        Resume resume = resumeRepository
                .findByIdAndUserAndIsActiveTrue(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume", "id", id));

        resume.setIsActive(false);
        resumeRepository.save(resume);
        log.info("Resume soft-deleted: id={} by user={}", id, currentUser.getEmail());
    }

    /**
     * Map MIME type to a clean label for display.
     */
    private String resolveFileType(String contentType) {
        if (contentType == null) return "UNKNOWN";
        return switch (contentType) {
            case "application/pdf" -> "PDF";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    -> "DOCX";
            default -> "UNKNOWN";
        };
    }
}