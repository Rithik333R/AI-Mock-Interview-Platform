package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * SkillGap — result of one AI skill gap analysis.
 *
 * Stores the outcome of comparing a resume against a target role.
 * Skills are stored as JSON arrays serialised to TEXT columns:
 *   currentSkills  → skills found in the resume
 *   missingSkills  → skills required for the role but absent in resume
 *   proficiencyMap → JSON object: { "Java": "ADVANCED", "Docker": "BEGINNER" }
 *
 * Why store skills as JSON strings?
 *   Skills lists are always read/written as a unit — we never
 *   query "find all users who know Java" at this stage.
 *   A JSON column avoids a skills join table with no query benefit.
 *
 * One user can have multiple SkillGap records (one per analysis).
 * The most recent one is surfaced in the dashboard and roadmap flow.
 */
@Entity
@Table(name = "skill_gaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGap extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The resume this analysis was based on.
     * Nullable — user could request analysis without a resume
     * (just typing skills manually — future feature).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(name = "target_role", nullable = false, length = 150)
    private String targetRole;

    /**
     * JSON array string — skills found in the resume.
     * e.g. '["Java","Spring Boot","MySQL","Git"]'
     */
    @Column(name = "current_skills", columnDefinition = "TEXT")
    private String currentSkills;

    /**
     * JSON array string — skills required for the role but missing.
     * e.g. '["Kubernetes","Kafka","Redis","AWS"]'
     */
    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    /**
     * JSON object string — proficiency level per skill.
     * e.g. '{"Java":"ADVANCED","Docker":"BEGINNER","Kafka":"NOT_STARTED"}'
     */
    @Column(name = "proficiency_map", columnDefinition = "TEXT")
    private String proficiencyMap;

    /**
     * Overall readiness score for the target role: 0–100.
     * Computed by the AI based on skill overlap and proficiency levels.
     */
    @Column(name = "readiness_score")
    private Integer readinessScore;

    /**
     * Short AI-generated summary paragraph of the analysis.
     */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;
}