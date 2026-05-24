package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Interview — one mock interview session.
 *
 * Lifecycle:
 *   IN_PROGRESS → user is answering questions
 *   COMPLETED   → user submitted all answers, overall score computed
 *
 * One Interview has many InterviewQuestions.
 * CascadeType.ALL — when we save/delete an Interview,
 * its questions are saved/deleted automatically.
 */
@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_role", nullable = false, length = 150)
    private String targetRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.IN_PROGRESS;

    /**
     * Overall score computed when session is completed.
     * Average of all per-answer scores (0-10 scale).
     * Null until completed.
     */
    @Column(name = "overall_score")
    private Double overallScore;

    /**
     * One Interview owns many InterviewQuestions.
     * orphanRemoval = true: if a question is removed from this list,
     * it is deleted from the DB automatically.
     */
    @OneToMany(mappedBy = "interview",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("sequenceNumber ASC")
    @Builder.Default
    private List<InterviewQuestion> questions = new ArrayList<>();

    // ── Enums ─────────────────────────────────────────────────────────

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum InterviewStatus {
        IN_PROGRESS, COMPLETED
    }
}