package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * SubmitAnswerRequest — payload for POST /api/interviews/{id}/answer
 *
 * The user provides:
 *   questionId → which question they are answering
 *   answerText → their actual answer (free text)
 */
@Getter
@Setter
public class SubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Answer text is required")
    @Size(min = 10, max = 5000,
            message = "Answer must be between 10 and 5000 characters")
    private String answerText;
}