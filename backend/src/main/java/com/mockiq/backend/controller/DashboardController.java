package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.response.*;
import com.mockiq.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_DASHBOARD, description = SwaggerConstants.DESC_DASHBOARD)
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(
            summary     = "Get dashboard summary",
            description = "Returns overall stats: total and completed interviews, " +
                    "average and best scores, total resumes, best ATS score, " +
                    "and overall completion rate."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Summary returned (zeros if no data yet)")
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse summary = dashboardService.getSummary();
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard summary fetched", summary));
    }

    @Operation(
            summary     = "Get interview stats by difficulty",
            description = "Returns session counts and average scores broken down by " +
                    "EASY / MEDIUM / HARD difficulty, plus total questions answered."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Stats returned")
    @GetMapping("/interview-stats")
    public ResponseEntity<ApiResponse<InterviewStatsResponse>> getInterviewStats() {
        InterviewStatsResponse stats = dashboardService.getInterviewStats();
        return ResponseEntity.ok(
                ApiResponse.success("Interview stats fetched", stats));
    }

    @Operation(
            summary     = "Get score trend",
            description = "Returns the last 10 completed interview scores in chronological " +
                    "order for a progress chart, plus a trend direction: " +
                    "`IMPROVING`, `DECLINING`, `STABLE`, or `INSUFFICIENT_DATA`."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Score trend returned")
    @GetMapping("/score-trend")
    public ResponseEntity<ApiResponse<ScoreTrendResponse>> getScoreTrend() {
        ScoreTrendResponse trend = dashboardService.getScoreTrend();
        return ResponseEntity.ok(
                ApiResponse.success("Score trend fetched", trend));
    }

    @Operation(
            summary     = "Get skill summary",
            description = "Returns most-practiced roles (by session count with average score) " +
                    "and ATS score summaries for all scored resumes."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Skill summary returned")
    @GetMapping("/skill-summary")
    public ResponseEntity<ApiResponse<SkillSummaryResponse>> getSkillSummary() {
        SkillSummaryResponse summary = dashboardService.getSkillSummary();
        return ResponseEntity.ok(
                ApiResponse.success("Skill summary fetched", summary));
    }
}