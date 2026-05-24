package com.mockiq.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.mockiq.backend.config.AppProperties;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * FileStorageService — handles all file upload/delete operations.
 *
 * Responsibility: talk to Cloudinary. Nothing else.
 *
 * Why upload as "raw" resource type?
 *   Cloudinary's default resource type is "image".
 *   PDFs and DOCX are not images — they must be uploaded
 *   as "raw" so Cloudinary stores them as-is without
 *   trying to transform them.
 *
 * Why generate a UUID for the public_id?
 *   Cloudinary uses public_id as the file identifier.
 *   Using the original filename risks collisions and
 *   exposes user data in the URL. UUID is safe and unique.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary       cloudinary;
    private final AppProperties    appProperties;

    // Allowed file types for resume uploads
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    /**
     * Upload a resume file to Cloudinary.
     *
     * @param file the uploaded MultipartFile from the request
     * @return UploadResult containing the public_id and secure URL
     */
    public UploadResult uploadResume(MultipartFile file) {

        // 1. Validate file is not empty
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload");
        }

        // 2. Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException(
                    "Invalid file type. Only PDF and DOCX files are allowed");
        }

        // 3. Validate file size
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException(
                    "File size exceeds the maximum limit of 10MB");
        }

        try {
            // 4. Build a unique public_id: folder/uuid
            String folder   = appProperties.getCloudinary().getFolder();
            String publicId = folder + "/" + UUID.randomUUID();

            // 5. Upload to Cloudinary as raw (not image)
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id",     publicId,
                            "resource_type", "raw",         // required for PDF/DOCX
                            "overwrite",     false
                    )
            );

            String returnedPublicId = (String) uploadResult.get("public_id");
            String secureUrl        = (String) uploadResult.get("secure_url");

            log.info("File uploaded to Cloudinary: {}", returnedPublicId);

            return new UploadResult(returnedPublicId, secureUrl);

        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new BadRequestException(
                    "Failed to upload file. Please try again.");
        }
    }

    /**
     * Delete a file from Cloudinary by its public_id.
     * Called when a user deletes a resume.
     *
     * We don't throw if deletion fails — the DB record
     * is soft-deleted regardless. A failed Cloudinary delete
     * is logged for manual cleanup but doesn't break the user flow.
     */
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "raw")
            );
            log.info("File deleted from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary [{}]: {}",
                    publicId, e.getMessage());
        }
    }

    /**
     * Simple value object to return both pieces of upload data.
     * No need for a full DTO — this is internal to the service layer.
     */
    public record UploadResult(String publicId, String secureUrl) {}
}