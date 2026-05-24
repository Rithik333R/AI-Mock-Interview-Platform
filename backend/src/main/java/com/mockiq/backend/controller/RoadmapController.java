package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.GenerateRoadmapRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.RoadmapResponse;
import com.mockiq.backend.service.RoadmapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_ROADMAP, description = SwaggerConstants.DESC_ROADMAP)
@SecurityRequirement(name = "bearerAuth")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @Operation(
            summary     = "Generate a learning roadmap",
            description = "Takes a skill gap analysis ID and generates a personalised " +
                    "week-by-week learning plan. Any previously active roadmap is " +
                    "automatically deactivated. **Takes 5–10 seconds.** " +
                    "Run `/api/skill-gap/analyze` first to get a `skillGapId`."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Roadmap generated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "No missing skills found in the analysis"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Skill gap analysis not found")
    })
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<RoadmapResponse>> generate(
            @Valid @RequestBody GenerateRoadmapRequest request) {
        log.debug("Roadmap generation requested — skillGapId={}",
                request.getSkillGapId());
        RoadmapResponse response = roadmapService.generate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Roadmap generated successfully", response));
    }

    @Operation(
            summary     = "Get active roadmap",
            description = "Returns the currently active roadmap with all milestones " +
                    "and their completion status."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Active roadmap returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description  = "No active roadmap — call /generate first")
    })
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<RoadmapResponse>> getActive() {
        RoadmapResponse response = roadmapService.getActive();
        return ResponseEntity.ok(
                ApiResponse.success("Active roadmap fetched", response));
    }

    @Operation(
            summary     = "Complete a milestone",
            description = "Marks one milestone as completed and recalculates the overall " +
                    "completion percentage. Use the `id` field from the milestones array " +
                    "as `milestoneId`. Each milestone can only be completed once."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description  = "Milestone marked complete, percentage updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Milestone already completed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Roadmap or milestone not found")
    })
    @PatchMapping("/{id}/milestone/{milestoneId}/complete")
    public ResponseEntity<ApiResponse<RoadmapResponse>> completeMilestone(
            @Parameter(description = "Roadmap ID")      @PathVariable Long id,
            @Parameter(description = "Milestone ID")    @PathVariable int  milestoneId) {
        log.debug("Milestone completion — roadmapId={}, milestoneId={}", id, milestoneId);
        RoadmapResponse response = roadmapService.completeMilestone(id, milestoneId);
        return ResponseEntity.ok(ApiResponse.success(
                "Milestone marked complete. Progress: " +
                        response.getCompletionPercentage() + "%", response));
    }
}