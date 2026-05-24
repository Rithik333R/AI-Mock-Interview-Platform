package com.mockiq.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.ai.RoadmapGeneratorAI.Milestone;
import com.mockiq.backend.entity.Roadmap;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

/**
 * RoadmapResponse — public representation of a Roadmap.
 *
 * Milestones are deserialised from the JSON string stored in the
 * entity back into a typed List<Milestone> for the API response.
 *
 * The Milestone record from RoadmapGeneratorAI is reused here
 * as the DTO — it's already clean (no entity fields) and
 * Jackson serialises records natively.
 */
@Slf4j
@Getter
@Builder
public class RoadmapResponse {

    private Long             id;
    private String           targetRole;
    private int              totalWeeks;
    private List<Milestone>  milestones;
    private double           completionPercentage;
    private boolean          isActive;
    private Long             skillGapId;
    private LocalDateTime    createdAt;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static RoadmapResponse fromEntity(Roadmap roadmap) {
        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .targetRole(roadmap.getTargetRole())
                .totalWeeks(roadmap.getTotalWeeks())
                .milestones(parseMilestones(roadmap.getMilestones()))
                .completionPercentage(
                        roadmap.getCompletionPercentage() != null
                                ? roadmap.getCompletionPercentage() : 0.0)
                .isActive(Boolean.TRUE.equals(roadmap.getIsActive()))
                .skillGapId(
                        roadmap.getSkillGap() != null
                                ? roadmap.getSkillGap().getId() : null)
                .createdAt(roadmap.getCreatedAt())
                .build();
    }

    private static List<Milestone> parseMilestones(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse milestones JSON: {}", e.getMessage());
            return List.of();
        }
    }
}