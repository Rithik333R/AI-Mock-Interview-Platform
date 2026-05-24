package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.AnalyzeSkillGapRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.SkillGapResponse;
import com.mockiq.backend.service.SkillGapService;
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

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/skill-gap")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_SKILLGAP, description = SwaggerConstants.DESC_SKILLGAP)
@SecurityRequirement(name = "bearerAuth")
public class SkillGapController {

    private final SkillGapService skillGapService;

    /**
     * IMPORTANT — method ordering matters here.
     *
     * Spring MVC matches literal paths before variable paths,
     * but only when literals are registered first.
     * /latest and /analyze MUST be declared before /{id}
     * to prevent "analyze" or "latest" being treated as a Long id.
     */

    @Operation(
            summary     = "Analyse skill gap",
            description = "Sends the resume's extracted text and target role to Gemini AI. " +
                    "Returns current skills (from resume), missing skills " +
                    "(required for role), proficiency levels, and a readiness score (0–100). " +
                    "**Takes 5–10 seconds.**"
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Analysis completed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "Resume has no extracted text"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Resume not found")
    })
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<SkillGapResponse>> analyze(
            @Valid @RequestBody AnalyzeSkillGapRequest request) {
        log.debug("Skill gap analysis requested — resumeId={}, role={}",
                request.getResumeId(), request.getTargetRole());
        SkillGapResponse response = skillGapService.analyze(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skill gap analysis completed", response));
    }

    @Operation(
            summary     = "Get latest skill gap analysis",
            description = "Returns the most recent skill gap analysis for the authenticated user."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Latest analysis returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description  = "No analysis found — run /analyze first")
    })
    @GetMapping("/latest")                   // ← literal BEFORE /{id}
    public ResponseEntity<ApiResponse<SkillGapResponse>> getLatest() {
        SkillGapResponse response = skillGapService.getLatest();
        return ResponseEntity.ok(
                ApiResponse.success("Latest skill gap fetched", response));
    }

    @Operation(
            summary     = "Get all skill gap analyses",
            description = "Returns all past skill gap analyses for the authenticated user, newest first."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Analysis history returned")
    @GetMapping                              // ← exact /api/skill-gap (no suffix)
    public ResponseEntity<ApiResponse<List<SkillGapResponse>>> getAll() {
        List<SkillGapResponse> responses = skillGapService.getAll();
        return ResponseEntity.ok(
                ApiResponse.success("Skill gap analyses fetched", responses));
    }

    @Operation(
            summary     = "Get skill gap analysis by ID",
            description = "Returns one specific skill gap analysis."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Analysis returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Analysis not found")
    })
    @GetMapping("/{id}")                     // ← variable path LAST
    public ResponseEntity<ApiResponse<SkillGapResponse>> getById(
            @Parameter(description = "Skill gap analysis ID — must be a numeric Long")
            @PathVariable Long id) {
        SkillGapResponse response = skillGapService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Skill gap fetched", response));
    }
}