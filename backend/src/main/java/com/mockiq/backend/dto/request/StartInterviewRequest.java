package com.mockiq.backend.dto.request;

import com.mockiq.backend.entity.Interview.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * StartInterviewRequest — payload for POST /api/interviews/start
 *
 * The user chooses:
 *   targetRole  → what job they're preparing for
 *   difficulty  → how hard the questions should be
 */
@Getter
@Setter
public class StartInterviewRequest {

    @NotBlank(message = "Target role is required")
    @Size(min = 2, max = 150,
            message = "Target role must be between 2 and 150 characters")
    private String targetRole;

    @NotNull(message = "Difficulty is required (EASY, MEDIUM, or HARD)")
    private Difficulty difficulty;
}