package com.mockiq.backend.dto.response;

import com.mockiq.backend.entity.Interview;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * InterviewResponse — represents one interview session in API responses.
 *
 * Used for both the list view (no questions) and the
 * full report view (with questions + answers).
 *
 * The "questions" field is null in list responses and
 * populated in the report response — this avoids loading
 * all question data when the user just wants a history list.
 */
@Getter
@Builder
public class InterviewSessionResponse {

    private Long          id;
    private String        targetRole;
    private String        difficulty;
    private String        status;
    private Double        overallScore;
    private LocalDateTime createdAt;

    /** Populated only in the full report — null in list view */
    private List<InterviewQuestionResponse> questions;

    /** Summary stats — populated only in the full report */
    private Integer totalQuestions;
    private Integer answeredQuestions;

    public static InterviewSessionResponse fromEntity(Interview interview) {
        return InterviewSessionResponse.builder()
                .id(interview.getId())
                .targetRole(interview.getTargetRole())
                .difficulty(interview.getDifficulty().name())
                .status(interview.getStatus().name())
                .overallScore(interview.getOverallScore())
                .createdAt(interview.getCreatedAt())
                .build();
    }

    public static InterviewSessionResponse fromEntityWithQuestions(
            Interview interview,
            List<InterviewQuestionResponse> questions) {

        long answered = questions.stream()
                .filter(q -> q.getResponse() != null)
                .count();

        return InterviewSessionResponse.builder()
                .id(interview.getId())
                .targetRole(interview.getTargetRole())
                .difficulty(interview.getDifficulty().name())
                .status(interview.getStatus().name())
                .overallScore(interview.getOverallScore())
                .createdAt(interview.getCreatedAt())
                .questions(questions)
                .totalQuestions(questions.size())
                .answeredQuestions((int) answered)
                .build();
    }
}