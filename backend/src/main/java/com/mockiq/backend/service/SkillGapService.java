package com.mockiq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.ai.SkillGapAnalyzerAI;
import com.mockiq.backend.ai.SkillGapAnalyzerAI.SkillGapResult;
import com.mockiq.backend.dto.request.AnalyzeSkillGapRequest;
import com.mockiq.backend.dto.response.SkillGapResponse;
import com.mockiq.backend.entity.Resume;
import com.mockiq.backend.entity.SkillGap;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.exception.BadRequestException;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.ResumeRepository;
import com.mockiq.backend.repository.SkillGapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * SkillGapService — orchestrates skill gap analysis.
 *
 * Flow:
 *   1. Load the resume (verify ownership)
 *   2. Guard: extracted text must exist
 *   3. Call SkillGapAnalyzerAI → get typed result
 *   4. Serialise skill lists/map to JSON strings for storage
 *   5. Save SkillGap entity
 *   6. Return SkillGapResponse
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillGapService {

    private final SkillGapAnalyzerAI  skillGapAnalyzerAI;
    private final SkillGapRepository  skillGapRepository;
    private final ResumeRepository    resumeRepository;
    private final UserService         userService;
    private final ObjectMapper        objectMapper;

    /**
     * POST /api/skill-gap/analyze
     */
    @Transactional
    public SkillGapResponse analyze(AnalyzeSkillGapRequest request) {
        User currentUser = userService.getCurrentUser();

        // 1. Load resume — scoped to current user
        Resume resume = resumeRepository
                .findByIdAndUserAndIsActiveTrue(request.getResumeId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume", "id", request.getResumeId()));

        // 2. Guard: extracted text must exist
        if (resume.getExtractedText() == null
                || resume.getExtractedText().isBlank()) {
            throw new BadRequestException(
                    "This resume has no extracted text. " +
                            "Please re-upload the file before running analysis.");
        }

        // 3. Call Gemini
        SkillGapResult result = skillGapAnalyzerAI.analyze(
                resume.getExtractedText(),
                request.getTargetRole());

        // 4. Serialise collections to JSON strings for the DB column
        SkillGap skillGap = SkillGap.builder()
                .user(currentUser)
                .resume(resume)
                .targetRole(request.getTargetRole().trim())
                .currentSkills(toJson(result.currentSkills()))
                .missingSkills(toJson(result.missingSkills()))
                .proficiencyMap(toJson(result.proficiencyMap()))
                .readinessScore(result.readinessScore())
                .summary(result.summary())
                .build();

        SkillGap saved = skillGapRepository.save(skillGap);
        log.info("Skill gap saved: id={}, readiness={}%, user={}",
                saved.getId(), saved.getReadinessScore(), currentUser.getEmail());

        return SkillGapResponse.fromEntity(saved);
    }

    /**
     * GET /api/skill-gap/latest
     * Most recent analysis for the current user.
     */
    @Transactional(readOnly = true)
    public SkillGapResponse getLatest() {
        User currentUser = userService.getCurrentUser();
        SkillGap skillGap = skillGapRepository
                .findTopByUserOrderByCreatedAtDesc(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No skill gap analysis found. " +
                                "Please run an analysis first."));
        return SkillGapResponse.fromEntity(skillGap);
    }

    /**
     * GET /api/skill-gap — all analyses for the user
     */
    @Transactional(readOnly = true)
    public List<SkillGapResponse> getAll() {
        User currentUser = userService.getCurrentUser();
        return skillGapRepository.findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(SkillGapResponse::fromEntity)
                .toList();
    }

    /**
     * GET /api/skill-gap/{id} — one analysis by ID
     */
    @Transactional(readOnly = true)
    public SkillGapResponse getById(Long id) {
        User currentUser = userService.getCurrentUser();
        SkillGap skillGap = skillGapRepository
                .findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SkillGap", "id", id));
        return SkillGapResponse.fromEntity(skillGap);
    }

    // ── Helper ────────────────────────────────────────────────────────

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.error("Failed to serialise to JSON: {}", e.getMessage());
            return "[]";
        }
    }
}