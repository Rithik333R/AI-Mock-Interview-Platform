package com.mockiq.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * SkillSummaryResponse — role practice frequency and ATS performance.
 *
 * Returned by GET /api/dashboard/skill-summary
 *
 * rolePracticeFrequency → roles ordered by how many times practiced,
 *                         most practiced first
 * resumeAtsSummary      → per-resume ATS score if scored, newest first
 */
@Getter
@Builder
public class SkillSummaryResponse {

    private List<RoleFrequency>  rolePracticeFrequency;
    private List<ResumeAtsSummary> resumeAtsSummary;

    /**
     * How many times the user has practiced for a specific role
     * and their average score in those sessions.
     */
    @Getter
    @Builder
    public static class RoleFrequency {
        private String targetRole;
        private long   sessionCount;
        private double averageScore;   // 0.0 if no completed sessions for this role
    }

    /**
     * ATS score summary for one resume.
     * Only included for resumes that have been scored.
     */
    @Getter
    @Builder
    public static class ResumeAtsSummary {
        private Long   resumeId;
        private String fileName;
        private int    atsScore;
        private String jobDescriptionPreview;  // first 80 chars of the JD
    }
}