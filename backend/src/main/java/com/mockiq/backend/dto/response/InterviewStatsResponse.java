package com.mockiq.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * InterviewStatsResponse — interview performance breakdown.
 *
 * Returned by GET /api/dashboard/interview-stats
 *
 * Contains:
 *   byDifficulty → one entry per difficulty level showing
 *                  count and average score at that level
 *   totalAnswered → total individual questions answered across all sessions
 *   averageAnswersPerSession → how many questions the user typically answers
 */
@Getter
@Builder
public class InterviewStatsResponse {

    private List<DifficultyBreakdown> byDifficulty;
    private long                      totalAnswered;
    private double                    averageAnswersPerSession;

    /**
     * Stats for one difficulty level (EASY / MEDIUM / HARD).
     */
    @Getter
    @Builder
    public static class DifficultyBreakdown {
        private String difficulty;
        private long   totalSessions;
        private long   completedSessions;
        private double averageScore;    // 0.0 if no completed sessions yet
    }
}