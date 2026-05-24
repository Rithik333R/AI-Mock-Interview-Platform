package com.mockiq.backend.dto.response;

import com.mockiq.backend.entity.InterviewResponse;
import lombok.Builder;
import lombok.Getter;

/**
 * InterviewResponseDTO — the user's answer + AI feedback for one question.
 *
 * Named InterviewResponseDTO (not InterviewResponse) to avoid
 * collision with the entity class of the same name.
 */
@Getter
@Builder
public class InterviewResponseDTO {

    private Long   id;
    private String answerText;
    private String aiFeedback;
    private int    clarityScore;
    private int    relevanceScore;
    private int    depthScore;
    private double overallScore;
    private String improvementTips;

    public static InterviewResponseDTO fromEntity(InterviewResponse r) {
        return InterviewResponseDTO.builder()
                .id(r.getId())
                .answerText(r.getAnswerText())
                .aiFeedback(r.getAiFeedback())
                .clarityScore(r.getClarityScore() != null ? r.getClarityScore() : 0)
                .relevanceScore(r.getRelevanceScore() != null ? r.getRelevanceScore() : 0)
                .depthScore(r.getDepthScore() != null ? r.getDepthScore() : 0)
                .overallScore(r.getOverallScore() != null ? r.getOverallScore() : 0.0)
                .improvementTips(r.getImprovementTips())
                .build();
    }
}