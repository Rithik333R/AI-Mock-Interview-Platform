package com.mockiq.backend.repository;

import com.mockiq.backend.entity.Roadmap;
import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * RoadmapRepository — data access for Roadmap entities.
 */
@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    /**
     * The currently active roadmap for a user.
     * Returns empty if the user has never generated one.
     */
    Optional<Roadmap> findByUserAndIsActiveTrue(User user);

    /**
     * Find one by ID, scoped to the user.
     */
    Optional<Roadmap> findByIdAndUser(Long id, User user);

    /**
     * Deactivate all existing roadmaps for a user before
     * creating a new one. Ensures only one active roadmap at a time.
     *
     * @Modifying — required for UPDATE/DELETE JPQL queries.
     * Works within the calling method's @Transactional boundary.
     */
    @Modifying
    @Query("UPDATE Roadmap r SET r.isActive = false WHERE r.user = :user")
    void deactivateAllForUser(@Param("user") User user);
}