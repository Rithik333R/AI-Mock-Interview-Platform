package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Roadmap — a week-by-week AI-generated learning plan.
 *
 * Generated from a SkillGap analysis. One user has one active roadmap
 * at a time — generating a new one deactivates the previous one.
 *
 * Milestones are stored as a JSON array in a TEXT column:
 * [
 *   {
 *     "id": 1,
 *     "weekNumber": 1,
 *     "title": "Learn Docker fundamentals",
 *     "description": "...",
 *     "skills": ["Docker", "containerisation"],
 *     "resources": ["https://docs.docker.com", "Docker Deep Dive (book)"],
 *     "completed": false
 *   },
 *   ...
 * ]
 *
 * Why store milestones as JSON?
 *   Milestones are always fetched, displayed, and updated as a unit.
 *   A separate milestones table would add a join with zero query benefit.
 *   When the user completes a milestone, we parse the JSON,
 *   flip the flag, reserialise, and save — simple and fast.
 */
@Entity
@Table(name = "roadmaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Roadmap extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The skill gap analysis this roadmap was generated from.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_gap_id")
    private SkillGap skillGap;

    @Column(name = "target_role", nullable = false, length = 150)
    private String targetRole;

    /**
     * Total weeks to complete the roadmap.
     * Determined by the AI based on number of missing skills.
     */
    @Column(name = "total_weeks", nullable = false)
    private Integer totalWeeks;

    /**
     * JSON array of milestone objects (see class-level Javadoc).
     */
    @Column(name = "milestones", nullable = false, columnDefinition = "LONGTEXT")
    private String milestones;

    /**
     * Percentage of milestones marked completed: 0.0–100.0.
     * Updated every time the user marks a milestone complete.
     */
    @Column(name = "completion_percentage", nullable = false)
    @Builder.Default
    private Double completionPercentage = 0.0;

    /**
     * Only one roadmap is active per user at a time.
     * When a new roadmap is generated, all previous ones
     * are set to isActive = false.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}