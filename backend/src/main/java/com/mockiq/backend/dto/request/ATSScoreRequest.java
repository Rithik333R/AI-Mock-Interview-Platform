package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * ATSScoreRequest — payload for POST /api/resumes/{id}/ats-score
 *
 * The user pastes in the job description they want to apply for.
 * Gemini compares it against their resume's extracted text
 * and returns a compatibility score + detailed feedback.
 *
 * Min 50 chars — a one-line job title isn't a real JD.
 * Max 5000 chars — enough for any real job posting.
 */
@Getter
@Setter
public class ATSScoreRequest {

    @NotBlank(message = "Job description is required")
    @Size(min = 50, max = 5000,
            message = "Job description must be between 50 and 5000 characters")
    private String jobDescription;
}