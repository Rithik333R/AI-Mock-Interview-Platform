package com.mockiq.backend.repository;

import com.mockiq.backend.entity.SkillGap;
import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * SkillGapRepository — data access for SkillGap analyses.
 */
@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {

    /**
     * Most recent skill gap analysis for a user.
     * Used in GET /api/skill-gap/latest
     */
    Optional<SkillGap> findTopByUserOrderByCreatedAtDesc(User user);

    /**
     * All skill gap analyses for a user, newest first.
     * Used for history listing.
     */
    List<SkillGap> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find one by ID, scoped to the user.
     */
    Optional<SkillGap> findByIdAndUser(Long id, User user);
}