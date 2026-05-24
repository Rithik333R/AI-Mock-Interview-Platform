package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * InterviewResponse — the user's answer to one question + AI feedback.
 *
 * Created when the user submits an answer via
 * POST /api/interviews/{id}/answer
 *
 * AI scores three dimensions (each 0-10):
 *   clarityScore    → how clearly was the answer communicated?
 *   relevanceScore  → how well did it address the question?
 *   depthScore      → how much technical/contextual depth shown?
 *
 * Overall per-question score = average of the three dimensions.
 * Interview overall score    = average of all question scores.
 */
@Entity
@Table(name = "interview_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResponse extends BaseEntity {

    /**
     * The question this response answers.
     * @OneToOne with the FK column on this side (interview_response.question_id)
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @Column(name = "answer_text", nullable = false, columnDefinition = "LONGTEXT")
    private String answerText;

    // ── AI Feedback Fields ─────────────────────────────────────────────

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    /** 0-10: how clearly the answer was communicated */
    @Column(name = "clarity_score")
    private Integer clarityScore;

    /** 0-10: how directly it answered the question asked */
    @Column(name = "relevance_score")
    private Integer relevanceScore;

    /** 0-10: depth of knowledge demonstrated */
    @Column(name = "depth_score")
    private Integer depthScore;

    /**
     * Average of the three dimension scores.
     * Stored for quick sorting/reporting without recalculating.
     */
    @Column(name = "overall_score")
    private Double overallScore;

    /**
     * AI-generated improvement tips — stored as a plain string
     * (newline-separated bullet points).
     */
    @Column(name = "improvement_tips", columnDefinition = "TEXT")
    private String improvementTips;
}