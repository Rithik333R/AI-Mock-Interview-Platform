package com.mockiq.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.entity.SkillGap;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SkillGapResponse — public representation of a SkillGap analysis.
 *
 * Deserialises the JSON strings stored in the entity back into
 * typed Java objects (List<String>, Map<String, String>) for
 * clean JSON serialisation in the API response.
 */
@Slf4j
@Getter
@Builder
public class SkillGapResponse {

    private Long                id;
    private String              targetRole;
    private List<String>        currentSkills;
    private List<String>        missingSkills;
    private Map<String, String> proficiencyMap;
    private int                 readinessScore;
    private String              summary;
    private Long                resumeId;
    private LocalDateTime       createdAt;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static SkillGapResponse fromEntity(SkillGap skillGap) {
        return SkillGapResponse.builder()
                .id(skillGap.getId())
                .targetRole(skillGap.getTargetRole())
                .currentSkills(parseList(skillGap.getCurrentSkills()))
                .missingSkills(parseList(skillGap.getMissingSkills()))
                .proficiencyMap(parseMap(skillGap.getProficiencyMap()))
                .readinessScore(
                        skillGap.getReadinessScore() != null
                                ? skillGap.getReadinessScore() : 0)
                .summary(skillGap.getSummary())
                .resumeId(
                        skillGap.getResume() != null
                                ? skillGap.getResume().getId() : null)
                .createdAt(skillGap.getCreatedAt())
                .build();
    }

    private static List<String> parseList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse skills JSON: {}", json);
            return List.of();
        }
    }

    private static Map<String, String> parseMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse proficiency map JSON: {}", json);
            return Map.of();
        }
    }
}