package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * AnalyzeSkillGapRequest — payload for POST /api/skill-gap/analyze
 *
 * The user selects which resume to analyse and what role they are
 * targeting. Both are required — the AI needs resume text as context.
 */
@Getter
@Setter
public class AnalyzeSkillGapRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @NotBlank(message = "Target role is required")
    @Size(min = 2, max = 150,
            message = "Target role must be between 2 and 150 characters")
    private String targetRole;
}