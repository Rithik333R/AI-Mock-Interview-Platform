package com.mockiq.backend.repository;

import com.mockiq.backend.entity.Interview;
import com.mockiq.backend.entity.Interview.InterviewStatus;
import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * InterviewRepository — updated in Phase 6 with dashboard aggregate queries.
 */
@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserOrderByCreatedAtDesc(User user);

    Optional<Interview> findByIdAndUser(Long id, User user);

    // ── Dashboard queries ──────────────────────────────────────────────

    /** Total interview sessions for a user */
    long countByUser(User user);

    /** Total completed sessions for a user */
    long countByUserAndStatus(User user, InterviewStatus status);

    /** All completed sessions ordered oldest first — for score trend chart */
    List<Interview> findByUserAndStatusOrderByCreatedAtAsc(
            User user, InterviewStatus status);

    /**
     * Average overall score across all completed sessions.
     * Returns null if no completed sessions exist yet.
     */
    @Query("SELECT AVG(i.overallScore) FROM Interview i " +
            "WHERE i.user = :user AND i.status = 'COMPLETED' " +
            "AND i.overallScore IS NOT NULL")
    Double findAverageScoreByUser(@Param("user") User user);

    /**
     * Best (highest) overall score across all completed sessions.
     * Returns null if no completed sessions exist yet.
     */
    @Query("SELECT MAX(i.overallScore) FROM Interview i " +
            "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Double findBestScoreByUser(@Param("user") User user);

    /**
     * Count and average score grouped by difficulty level.
     * Returns Object[] rows: [difficulty, totalCount, completedCount, avgScore]
     *
     * We use a native-style JPQL projection here.
     * DashboardService maps these Object[] rows to DTOs.
     */
    @Query("SELECT i.difficulty, " +
            "COUNT(i), " +
            "SUM(CASE WHEN i.status = 'COMPLETED' THEN 1 ELSE 0 END), " +
            "AVG(CASE WHEN i.status = 'COMPLETED' THEN i.overallScore ELSE NULL END) " +
            "FROM Interview i WHERE i.user = :user GROUP BY i.difficulty")
    List<Object[]> findDifficultyBreakdownByUser(@Param("user") User user);

    /**
     * Count sessions and average score grouped by target role.
     * Returns Object[] rows: [targetRole, sessionCount, avgScore]
     * Ordered by session count descending (most practiced roles first).
     */
    @Query("SELECT i.targetRole, COUNT(i), " +
            "AVG(CASE WHEN i.status = 'COMPLETED' THEN i.overallScore ELSE NULL END) " +
            "FROM Interview i WHERE i.user = :user " +
            "GROUP BY i.targetRole ORDER BY COUNT(i) DESC")
    List<Object[]> findRoleFrequencyByUser(@Param("user") User user);
}