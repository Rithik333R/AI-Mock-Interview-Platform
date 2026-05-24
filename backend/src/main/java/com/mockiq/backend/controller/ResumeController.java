package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.ATSScoreRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.ATSScoreResponse;
import com.mockiq.backend.dto.response.ResumeResponse;
import com.mockiq.backend.service.ATSService;
import com.mockiq.backend.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_RESUME, description = SwaggerConstants.DESC_RESUME)
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {

    private final ResumeService resumeService;
    private final ATSService    atsService;

    @Operation(
            summary     = "Upload a resume",
            description = "Accepts a PDF or DOCX file (max 10MB). " +
                    "Text is extracted automatically and stored for AI analysis. " +
                    "Send as multipart/form-data with field name 'file'."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Resume uploaded and text extracted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "Invalid file type, size exceeded, or unreadable file")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @Parameter(description = "PDF or DOCX resume file — max 10MB")
            @RequestParam("file") MultipartFile file) {

        log.debug("Resume upload request — file: {}, size: {} bytes",
                file.getOriginalFilename(), file.getSize());
        ResumeResponse response = resumeService.uploadResume(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded successfully", response));
    }

    @Operation(
            summary     = "Get all my resumes",
            description = "Returns all active resumes for the authenticated user, newest first."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Resume list returned")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes() {
        List<ResumeResponse> resumes = resumeService.getMyResumes();
        return ResponseEntity.ok(
                ApiResponse.success("Resumes fetched successfully", resumes));
    }

    @Operation(
            summary     = "Get one resume by ID",
            description = "Returns a single resume. Only accessible by the owning user."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Resume found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Resume not found or belongs to another user")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(
            @Parameter(description = "Resume ID") @PathVariable Long id) {
        ResumeResponse resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Resume fetched successfully", resume));
    }

    @Operation(
            summary     = "Delete a resume",
            description = "Soft-deletes a resume (sets isActive = false). " +
                    "The file is retained in storage but hidden from all queries."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Resume deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Resume not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @Parameter(description = "Resume ID") @PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully"));
    }

    @Operation(
            summary     = "Generate ATS score",
            description = "Sends the resume's extracted text and the provided job description " +
                    "to Gemini AI. Returns a compatibility score (0–100) with matched/missing " +
                    "skills and improvement suggestions. Takes 3–8 seconds."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "ATS score generated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "Resume has no extracted text, or job description too short"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "503", description = "AI service unavailable")
    })
    @PostMapping("/{id}/ats-score")
    public ResponseEntity<ApiResponse<ATSScoreResponse>> generateATSScore(
            @Parameter(description = "Resume ID") @PathVariable Long id,
            @Valid @RequestBody ATSScoreRequest request) {
        log.debug("ATS score requested for resumeId={}", id);
        ATSScoreResponse result = atsService.generateATSScore(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("ATS score generated successfully", result));
    }
}