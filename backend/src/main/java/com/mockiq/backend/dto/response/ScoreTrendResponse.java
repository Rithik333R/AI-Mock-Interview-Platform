package com.mockiq.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ScoreTrendResponse — score progression over time.
 *
 * Returned by GET /api/dashboard/score-trend
 *
 * Each data point = one completed interview session.
 * Ordered oldest → newest so the frontend can plot left to right.
 */
@Getter
@Builder
public class ScoreTrendResponse {

    private List<ScorePoint> trend;

    /** Aggregate trend direction: IMPROVING / DECLINING / STABLE / INSUFFICIENT_DATA */
    private String trendDirection;

    /**
     * One data point on the score trend chart.
     */
    @Getter
    @Builder
    public static class ScorePoint {
        private Long          interviewId;
        private String        targetRole;
        private String        difficulty;
        private double        score;
        private LocalDateTime completedAt;
    }
}