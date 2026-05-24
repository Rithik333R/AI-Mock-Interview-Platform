package com.mockiq.backend.repository;

import com.mockiq.backend.entity.InterviewQuestion;
import com.mockiq.backend.entity.InterviewResponse;
import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * InterviewResponseRepository — updated in Phase 6 with dashboard query.
 */
@Repository
public interface InterviewResponseRepository
        extends JpaRepository<InterviewResponse, Long> {

    boolean existsByQuestion(InterviewQuestion question);

    Optional<InterviewResponse> findByQuestion(InterviewQuestion question);

    // ── Dashboard queries ──────────────────────────────────────────────

    /**
     * Total number of individual answers submitted by a user
     * across all their interview sessions.
     */
    @Query("SELECT COUNT(r) FROM InterviewResponse r " +
            "WHERE r.question.interview.user = :user")
    long countTotalAnswersByUser(@Param("user") User user);
}