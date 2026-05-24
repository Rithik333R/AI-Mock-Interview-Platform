package com.mockiq.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.ai.RoadmapGeneratorAI;
import com.mockiq.backend.ai.RoadmapGeneratorAI.Milestone;
import com.mockiq.backend.ai.RoadmapGeneratorAI.RoadmapResult;
import com.mockiq.backend.dto.request.GenerateRoadmapRequest;
import com.mockiq.backend.dto.response.RoadmapResponse;
import com.mockiq.backend.entity.Roadmap;
import com.mockiq.backend.entity.SkillGap;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.exception.BadRequestException;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.RoadmapRepository;
import com.mockiq.backend.repository.SkillGapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * RoadmapService — generates and manages learning roadmaps.
 *
 * Generate flow:
 *   1. Load the SkillGap analysis (verify ownership)
 *   2. Guard: must have missing skills to generate a plan
 *   3. Deactivate any existing active roadmap for the user
 *   4. Call RoadmapGeneratorAI
 *   5. Serialise milestones to JSON string
 *   6. Save new Roadmap entity
 *
 * Milestone completion flow:
 *   1. Load the active roadmap
 *   2. Parse milestones JSON → find milestone by id → flip completed flag
 *   3. Recompute completion percentage
 *   4. Reserialise and save
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapGeneratorAI roadmapGeneratorAI;
    private final RoadmapRepository  roadmapRepository;
    private final SkillGapRepository skillGapRepository;
    private final UserService        userService;
    private final ObjectMapper       objectMapper;

    /**
     * POST /api/roadmap/generate
     */
    @Transactional
    public RoadmapResponse generate(GenerateRoadmapRequest request) {
        User currentUser = userService.getCurrentUser();

        // 1. Load the skill gap — scoped to current user
        SkillGap skillGap = skillGapRepository
                .findByIdAndUser(request.getSkillGapId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SkillGap", "id", request.getSkillGapId()));

        // 2. Parse missing skills from stored JSON
        List<String> missingSkills = parseJsonList(skillGap.getMissingSkills());

        if (missingSkills.isEmpty()) {
            throw new BadRequestException(
                    "No missing skills found in this analysis. " +
                            "A roadmap cannot be generated.");
        }

        // 3. Deactivate previous roadmaps — one active at a time
        roadmapRepository.deactivateAllForUser(currentUser);
        log.debug("Previous roadmaps deactivated for user: {}",
                currentUser.getEmail());

        // 4. Generate via Gemini
        RoadmapResult result = roadmapGeneratorAI.generate(
                missingSkills,
                skillGap.getTargetRole(),
                skillGap.getReadinessScore() != null
                        ? skillGap.getReadinessScore() : 50);

        // 5. Save new Roadmap
        Roadmap roadmap = Roadmap.builder()
                .user(currentUser)
                .skillGap(skillGap)
                .targetRole(skillGap.getTargetRole())
                .totalWeeks(result.totalWeeks())
                .milestones(toJson(result.milestones()))
                .completionPercentage(0.0)
                .isActive(true)
                .build();

        Roadmap saved = roadmapRepository.save(roadmap);
        log.info("Roadmap generated: id={}, weeks={}, milestones={}, user={}",
                saved.getId(), saved.getTotalWeeks(),
                result.milestones().size(), currentUser.getEmail());

        return RoadmapResponse.fromEntity(saved);
    }

    /**
     * GET /api/roadmap/active
     * The currently active roadmap for the user.
     */
    @Transactional(readOnly = true)
    public RoadmapResponse getActive() {
        User currentUser = userService.getCurrentUser();
        Roadmap roadmap = roadmapRepository.findByUserAndIsActiveTrue(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active roadmap found. " +
                                "Please generate a roadmap first."));
        return RoadmapResponse.fromEntity(roadmap);
    }

    /**
     * PATCH /api/roadmap/{id}/milestone/{milestoneId}/complete
     *
     * Marks one milestone as completed and recomputes
     * the overall completion percentage.
     *
     * Why parse/modify/reserialise?
     *   Milestones are stored as a JSON blob — we own the
     *   update cycle. This is intentionally simple: read,
     *   modify in memory, write back. No separate table needed.
     */
    @Transactional
    public RoadmapResponse completeMilestone(Long roadmapId, int milestoneId) {
        User currentUser = userService.getCurrentUser();

        Roadmap roadmap = roadmapRepository.findByIdAndUser(roadmapId, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Roadmap", "id", roadmapId));

        // Parse existing milestones
        List<Milestone> milestones = parseJsonMilestones(roadmap.getMilestones());

        // Find the target milestone by id field
        boolean found = false;
        for (int i = 0; i < milestones.size(); i++) {
            if (milestones.get(i).id() == milestoneId) {
                Milestone original = milestones.get(i);
                if (original.completed()) {
                    throw new BadRequestException(
                            "Milestone " + milestoneId + " is already marked complete.");
                }
                // Records are immutable — create a new one with completed = true
                milestones.set(i, new Milestone(
                        original.id(),
                        original.weekNumber(),
                        original.title(),
                        original.description(),
                        original.skills(),
                        original.resources(),
                        true
                ));
                found = true;
                break;
            }
        }

        if (!found) {
            throw new ResourceNotFoundException(
                    "Milestone", "id", milestoneId);
        }

        // Recompute completion percentage
        long completedCount = milestones.stream()
                .filter(Milestone::completed)
                .count();
        double percentage = milestones.isEmpty() ? 0.0
                : Math.round((double) completedCount / milestones.size() * 1000.0)
                / 10.0; // round to 1 decimal place

        // Persist updated state
        roadmap.setMilestones(toJson(milestones));
        roadmap.setCompletionPercentage(percentage);
        roadmapRepository.save(roadmap);

        log.info("Milestone {} completed — roadmap {}, progress: {}%",
                milestoneId, roadmapId, percentage);

        return RoadmapResponse.fromEntity(roadmap);
    }

    // ── Private helpers ────────────────────────────────────────────────

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON list: {}", e.getMessage());
            return List.of();
        }
    }

    private List<Milestone> parseJsonMilestones(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("Failed to parse milestones JSON: {}", e.getMessage());
            throw new BadRequestException(
                    "Failed to read roadmap milestones. Please try again.");
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.error("Failed to serialise to JSON: {}", e.getMessage());
            return "[]";
        }
    }
}