package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.StartInterviewRequest;
import com.mockiq.backend.dto.request.SubmitAnswerRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.InterviewQuestionResponse;
import com.mockiq.backend.dto.response.InterviewSessionResponse;
import com.mockiq.backend.service.InterviewService;
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
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_INTERVIEW, description = SwaggerConstants.DESC_INTERVIEW)
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    @Operation(
            summary     = "Start a mock interview session",
            description = "Creates a new interview session and generates 5 AI questions " +
                    "tailored to the target role and difficulty. " +
                    "**Takes 5–10 seconds** while Gemini generates questions. " +
                    "Difficulty values: `EASY`, `MEDIUM`, `HARD`."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description  = "Session created with 5 questions"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Validation failed")
    })
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> startInterview(
            @Valid @RequestBody StartInterviewRequest request) {
        log.debug("Start interview — role={}, difficulty={}",
                request.getTargetRole(), request.getDifficulty());
        InterviewSessionResponse response = interviewService.startInterview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview started. Good luck!", response));
    }

    @Operation(
            summary     = "Submit an answer",
            description = "Submits one answer to a specific question within the session. " +
                    "Gemini evaluates the answer and returns scores for clarity, " +
                    "relevance, and depth. **Takes 3–6 seconds per answer.** " +
                    "Call this once per question — duplicate submissions are rejected."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description  = "Answer evaluated with AI feedback"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "Session already completed or question already answered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description  = "Interview or question not found")
    })
    @PostMapping("/{id}/answer")
    public ResponseEntity<ApiResponse<InterviewQuestionResponse>> submitAnswer(
            @Parameter(description = "Interview session ID") @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request) {
        log.debug("Answer submitted — interviewId={}, questionId={}",
                id, request.getQuestionId());
        InterviewQuestionResponse response = interviewService.submitAnswer(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Answer submitted and evaluated", response));
    }

    @Operation(
            summary     = "Complete the interview",
            description = "Marks the session as COMPLETED and computes the overall score " +
                    "(average of all answered questions on a 0–10 scale). " +
                    "Unanswered questions count as 0. Cannot be undone."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Session completed with overall score"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Session is already completed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Interview not found")
    })
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> completeInterview(
            @Parameter(description = "Interview session ID") @PathVariable Long id) {
        InterviewSessionResponse response = interviewService.completeInterview(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Interview completed. Overall score: " + response.getOverallScore() + "/10",
                response));
    }

    @Operation(
            summary     = "Get full interview report",
            description = "Returns the complete session: all questions, user answers, " +
                    "AI feedback, and per-question scores. Best viewed after completing."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Full report returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Interview not found")
    })
    @GetMapping("/{id}/report")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> getReport(
            @Parameter(description = "Interview session ID") @PathVariable Long id) {
        InterviewSessionResponse response = interviewService.getReport(id);
        return ResponseEntity.ok(
                ApiResponse.success("Report fetched successfully", response));
    }

    @Operation(
            summary     = "Get all my interviews",
            description = "Returns a lightweight list of all past sessions (no questions loaded). " +
                    "Use the report endpoint for full details on a specific session."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Interview history returned")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InterviewSessionResponse>>> getMyInterviews() {
        List<InterviewSessionResponse> interviews = interviewService.getMyInterviews();
        return ResponseEntity.ok(
                ApiResponse.success("Interviews fetched successfully", interviews));
    }
}