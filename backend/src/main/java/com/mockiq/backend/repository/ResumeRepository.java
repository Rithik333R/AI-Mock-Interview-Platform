package com.mockiq.backend.repository;

import com.mockiq.backend.entity.Resume;
import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ResumeRepository — updated in Phase 6 with dashboard queries.
 */
@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserAndIsActiveTrueOrderByCreatedAtDesc(User user);

    Optional<Resume> findByIdAndUserAndIsActiveTrue(Long id, User user);

    long countByUserAndIsActiveTrue(User user);

    // ── Dashboard queries ──────────────────────────────────────────────

    /**
     * Highest ATS score across all active, scored resumes for a user.
     * Returns null if no resumes have been scored yet.
     */
    @Query("SELECT MAX(r.atsScore) FROM Resume r " +
            "WHERE r.user = :user AND r.isActive = true " +
            "AND r.atsScore IS NOT NULL")
    Integer findBestAtsScoreByUser(@Param("user") User user);

    /**
     * All active resumes that have an ATS score, newest first.
     * Used for the resume ATS summary on the dashboard.
     */
    List<Resume> findByUserAndIsActiveTrueAndAtsScoreIsNotNullOrderByCreatedAtDesc(
            User user);
}