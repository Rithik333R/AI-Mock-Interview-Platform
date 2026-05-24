package com.mockiq.backend.dto.response;

import com.mockiq.backend.entity.InterviewQuestion;
import lombok.Builder;
import lombok.Getter;

/**
 * InterviewQuestionResponse — one question in a session.
 *
 * Note: expectedAnswer is intentionally included in the report view
 * (after the session is complete) so users can learn from it.
 * For an "active quiz" mode, you could filter it out — left as a
 * future enhancement.
 */
@Getter
@Builder
public class InterviewQuestionResponse {

    private Long   id;
    private String questionText;
    private String expectedAnswer;
    private String category;
    private int    sequenceNumber;

    /** Null until the user submits an answer */
    private InterviewResponseDTO response;

    public static InterviewQuestionResponse fromEntity(InterviewQuestion q) {
        return InterviewQuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .expectedAnswer(q.getExpectedAnswer())
                .category(q.getCategory().name())
                .sequenceNumber(q.getSequenceNumber())
                .response(q.getResponse() != null
                        ? InterviewResponseDTO.fromEntity(q.getResponse())
                        : null)
                .build();
    }
}