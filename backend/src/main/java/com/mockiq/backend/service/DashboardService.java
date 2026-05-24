package com.mockiq.backend.service;

import com.mockiq.backend.dto.response.*;
import com.mockiq.backend.dto.response.InterviewStatsResponse.DifficultyBreakdown;
import com.mockiq.backend.dto.response.ScoreTrendResponse.ScorePoint;
import com.mockiq.backend.dto.response.SkillSummaryResponse.ResumeAtsSummary;
import com.mockiq.backend.dto.response.SkillSummaryResponse.RoleFrequency;
import com.mockiq.backend.entity.Interview;
import com.mockiq.backend.entity.Interview.Difficulty;
import com.mockiq.backend.entity.Interview.InterviewStatus;
import com.mockiq.backend.entity.Resume;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.repository.InterviewRepository;
import com.mockiq.backend.repository.InterviewResponseRepository;
import com.mockiq.backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DashboardService — aggregates data from multiple repositories
 * into dashboard-ready response objects.
 *
 * Design decisions:
 *   - All queries are read-only (@Transactional(readOnly = true))
 *   - Null-safety: every aggregate query can return null
 *     (e.g. AVG with no rows). We default all nulls to 0.
 *   - Object[] mapping: JPQL GROUP BY queries return Object[] rows.
 *     We map them explicitly with index-based access and clear comments.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InterviewRepository         interviewRepository;
    private final InterviewResponseRepository responseRepository;
    private final ResumeRepository            resumeRepository;
    private final UserService                 userService;

    /**
     * GET /api/dashboard
     * Top-level summary card.
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        User user = userService.getCurrentUser();

        long   totalInterviews     = interviewRepository.countByUser(user);
        long   completedInterviews = interviewRepository
                .countByUserAndStatus(user, InterviewStatus.COMPLETED);
        double averageScore        = nullSafeDouble(
                interviewRepository.findAverageScoreByUser(user));
        double bestScore           = nullSafeDouble(
                interviewRepository.findBestScoreByUser(user));
        long   totalResumes        = resumeRepository
                .countByUserAndIsActiveTrue(user);
        int    bestAtsScore        = nullSafeInt(
                resumeRepository.findBestAtsScoreByUser(user));

        double completionRate = totalInterviews == 0 ? 0.0
                : round((double) completedInterviews / totalInterviews * 100);

        log.debug("Dashboard summary fetched for user: {}", user.getEmail());

        return DashboardSummaryResponse.builder()
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .averageScore(round(averageScore))
                .bestScore(round(bestScore))
                .totalResumes(totalResumes)
                .bestAtsScore(bestAtsScore)
                .completionRate(completionRate)
                .build();
    }

    /**
     * GET /api/dashboard/interview-stats
     * Per-difficulty breakdown + total answers submitted.
     */
    @Transactional(readOnly = true)
    public InterviewStatsResponse getInterviewStats() {
        User user = userService.getCurrentUser();

        // JPQL returns Object[] per row: [difficulty, total, completed, avgScore]
        List<Object[]> rawBreakdown =
                interviewRepository.findDifficultyBreakdownByUser(user);

        // Build a lookup map from what Gemini returned
        Map<String, Object[]> byDifficulty = rawBreakdown.stream()
                .collect(Collectors.toMap(
                        row -> ((Difficulty) row[0]).name(),
                        row -> row
                ));

        // Ensure all three difficulty levels appear even if user has 0 sessions
        List<DifficultyBreakdown> breakdowns = Arrays
                .stream(Difficulty.values())
                .map(d -> {
                    Object[] row = byDifficulty.get(d.name());
                    if (row == null) {
                        return DifficultyBreakdown.builder()
                                .difficulty(d.name())
                                .totalSessions(0L)
                                .completedSessions(0L)
                                .averageScore(0.0)
                                .build();
                    }
                    // row[0] = difficulty enum
                    // row[1] = total count (Long)
                    // row[2] = completed count (Long)
                    // row[3] = avg score (Double, nullable)
                    return DifficultyBreakdown.builder()
                            .difficulty(d.name())
                            .totalSessions(toLong(row[1]))
                            .completedSessions(toLong(row[2]))
                            .averageScore(round(nullSafeDouble((Double) row[3])))
                            .build();
                })
                .toList();

        long totalAnswered = responseRepository.countTotalAnswersByUser(user);

        long totalCompleted = interviewRepository
                .countByUserAndStatus(user, InterviewStatus.COMPLETED);

        double avgAnswersPerSession = totalCompleted == 0 ? 0.0
                : round((double) totalAnswered / totalCompleted);

        return InterviewStatsResponse.builder()
                .byDifficulty(breakdowns)
                .totalAnswered(totalAnswered)
                .averageAnswersPerSession(avgAnswersPerSession)
                .build();
    }

    /**
     * GET /api/dashboard/score-trend
     * Score progression over time (last 10 completed sessions).
     */
    @Transactional(readOnly = true)
    public ScoreTrendResponse getScoreTrend() {
        User user = userService.getCurrentUser();

        List<Interview> completed = interviewRepository
                .findByUserAndStatusOrderByCreatedAtAsc(
                        user, InterviewStatus.COMPLETED);

        // Keep last 10 sessions for the chart
        List<Interview> recent = completed.size() > 10
                ? completed.subList(completed.size() - 10, completed.size())
                : completed;

        List<ScorePoint> trend = recent.stream()
                .map(i -> ScorePoint.builder()
                        .interviewId(i.getId())
                        .targetRole(i.getTargetRole())
                        .difficulty(i.getDifficulty().name())
                        .score(round(nullSafeDouble(i.getOverallScore())))
                        .completedAt(i.getUpdatedAt())
                        .build())
                .toList();

        String direction = computeTrendDirection(trend);

        return ScoreTrendResponse.builder()
                .trend(trend)
                .trendDirection(direction)
                .build();
    }

    /**
     * GET /api/dashboard/skill-summary
     * Role frequency + ATS scores per resume.
     */
    @Transactional(readOnly = true)
    public SkillSummaryResponse getSkillSummary() {
        User user = userService.getCurrentUser();

        // Role frequency from JPQL: [targetRole, count, avgScore]
        List<Object[]> roleRows =
                interviewRepository.findRoleFrequencyByUser(user);

        List<RoleFrequency> roleFrequency = roleRows.stream()
                .map(row -> RoleFrequency.builder()
                        .targetRole((String) row[0])
                        .sessionCount(toLong(row[1]))
                        .averageScore(round(nullSafeDouble((Double) row[2])))
                        .build())
                .toList();

        // ATS summaries — only scored resumes
        List<Resume> scoredResumes = resumeRepository
                .findByUserAndIsActiveTrueAndAtsScoreIsNotNullOrderByCreatedAtDesc(user);

        List<ResumeAtsSummary> atsSummaries = scoredResumes.stream()
                .map(r -> ResumeAtsSummary.builder()
                        .resumeId(r.getId())
                        .fileName(r.getOriginalFileName())
                        .atsScore(r.getAtsScore())
                        .jobDescriptionPreview(truncate(r.getJobDescription(), 80))
                        .build())
                .toList();

        return SkillSummaryResponse.builder()
                .rolePracticeFrequency(roleFrequency)
                .resumeAtsSummary(atsSummaries)
                .build();
    }

    // ── Private helpers ────────────────────────────────────────────────

    /**
     * Compute overall trend direction from the score series.
     *
     * Strategy: compare the average of the first half to the second half.
     * Needs at least 3 data points to be meaningful.
     */
    private String computeTrendDirection(List<ScorePoint> trend) {
        if (trend.size() < 3) return "INSUFFICIENT_DATA";

        int mid = trend.size() / 2;

        double firstHalfAvg = trend.subList(0, mid).stream()
                .mapToDouble(ScorePoint::getScore)
                .average()
                .orElse(0.0);

        double secondHalfAvg = trend.subList(mid, trend.size()).stream()
                .mapToDouble(ScorePoint::getScore)
                .average()
                .orElse(0.0);

        double delta = secondHalfAvg - firstHalfAvg;

        if (delta >= 0.5)  return "IMPROVING";
        if (delta <= -0.5) return "DECLINING";
        return "STABLE";
    }

    /** Null-safe Double → double, defaults to 0.0 */
    private double nullSafeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    /** Null-safe Integer → int, defaults to 0 */
    private int nullSafeInt(Integer value) {
        return value != null ? value : 0;
    }

    /** JPQL COUNT returns Long — safe cast from Number */
    private long toLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        return 0L;
    }

    /** Round to 1 decimal place */
    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /** Truncate a string to maxChars, appending "..." if cut */
    private String truncate(String text, int maxChars) {
        if (text == null || text.isBlank()) return "";
        return text.length() <= maxChars
                ? text
                : text.substring(0, maxChars) + "...";
    }
}