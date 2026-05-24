package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * GenerateRoadmapRequest — payload for POST /api/roadmap/generate
 *
 * The user provides the skill gap analysis ID to generate a roadmap from.
 * The service loads the missing skills and target role from that record.
 *
 * Why reference the skill gap ID instead of re-sending skills?
 *   - Prevents the client from sending arbitrary skills not tied to a real analysis
 *   - Keeps the roadmap linked to a specific analysis for audit/history
 */
@Getter
@Setter
public class GenerateRoadmapRequest {

    @NotNull(message = "Skill gap ID is required")
    private Long skillGapId;
}