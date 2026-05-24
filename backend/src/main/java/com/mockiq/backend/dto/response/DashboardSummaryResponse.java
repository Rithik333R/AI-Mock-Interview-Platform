package com.mockiq.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * DashboardSummaryResponse — top-level stats card for the dashboard.
 *
 * Returned by GET /api/dashboard
 *
 * Fields:
 *   totalInterviews     → how many sessions the user has started
 *   completedInterviews → how many they finished
 *   averageScore        → mean overall score across all completed sessions
 *   bestScore           → highest overall score ever achieved
 *   totalResumes        → how many active resumes uploaded
 *   bestAtsScore        → highest ATS score across all scored resumes
 *   completionRate      → % of started interviews that were completed
 */
@Getter
@Builder
public class DashboardSummaryResponse {

    private long   totalInterviews;
    private long   completedInterviews;
    private double averageScore;
    private double bestScore;
    private long   totalResumes;
    private int    bestAtsScore;

    /**
     * Completion rate as a percentage (0–100).
     * e.g. 3 completed / 5 total = 60.0
     */
    private double completionRate;
}