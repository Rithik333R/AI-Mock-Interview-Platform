package com.mockiq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.ai.GeminiClient;
import com.mockiq.backend.dto.request.ATSScoreRequest;
import com.mockiq.backend.dto.response.ATSScoreResponse;
import com.mockiq.backend.entity.Resume;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.exception.BadRequestException;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ATSService — orchestrates ATS score generation via Gemini AI.
 *
 * Flow:
 *   1. Load the resume (verify it belongs to current user)
 *   2. Check extracted text exists (Phase 3 must have run)
 *   3. Build a structured prompt with resume text + job description
 *   4. Call Gemini → get JSON back
 *   5. Parse JSON into ATSScoreResponse
 *   6. Save score + feedback to the Resume entity
 *   7. Return the response
 *
 * Why save the result to the DB?
 *   AI calls are slow (~2-5s) and consume API quota.
 *   Storing the result means repeat views don't re-call Gemini.
 *   In Phase 5+ we can add "re-score" as an explicit action.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ATSService {

    private final GeminiClient     geminiClient;
    private final ResumeRepository resumeRepository;
    private final UserService      userService;
    private final ObjectMapper     objectMapper;

    /**
     * Generate an ATS score for a resume against a job description.
     */
    @Transactional
    public ATSScoreResponse generateATSScore(Long resumeId,
                                             ATSScoreRequest request) {
        User currentUser = userService.getCurrentUser();

        // 1. Load resume — scoped to current user
        Resume resume = resumeRepository
                .findByIdAndUserAndIsActiveTrue(resumeId, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume", "id", resumeId));

        // 2. Guard: extracted text must exist
        if (resume.getExtractedText() == null
                || resume.getExtractedText().isBlank()) {
            throw new BadRequestException(
                    "This resume has no extracted text. " +
                            "Please re-upload the file and try again.");
        }

        // 3. Build the prompt
        String prompt = buildATSPrompt(
                resume.getExtractedText(),
                request.getJobDescription());

        log.info("Calling Gemini for ATS score — resumeId={}, user={}",
                resumeId, currentUser.getEmail());

        // 4. Call Gemini
        String rawJson = geminiClient.generate(prompt);
        log.debug("Gemini raw response: {}", rawJson);

        // 5. Parse response
        ATSScoreResponse atsResult = parseATSResponse(rawJson);

        // 6. Persist score + feedback on the resume record
        resume.setAtsScore(atsResult.getScore());
        resume.setJobDescription(request.getJobDescription());
        resume.setAtsFeedback(rawJson);  // store raw JSON for future re-parsing
        resumeRepository.save(resume);

        log.info("ATS score saved — resumeId={}, score={}",
                resumeId, atsResult.getScore());

        return atsResult;
    }

    /**
     * Build a structured prompt that instructs Gemini to return
     * a specific JSON schema. This is the most important method —
     * prompt quality directly determines response quality.
     *
     * Key techniques used:
     *   - Role assignment ("You are an ATS expert")
     *   - Explicit JSON schema with field descriptions
     *   - "Return ONLY valid JSON" — prevents conversational wrapping
     *   - Score range definition (0-100)
     *   - Array fields for skills to ensure list format
     */
    private String buildATSPrompt(String resumeText, String jobDescription) {
        return """
                You are an expert ATS (Applicant Tracking System) analyst and career coach.
                
                Analyse the resume against the job description and return ONLY a valid JSON object.
                Do not include any explanation, markdown, or text outside the JSON.
                
                Required JSON structure:
                {
                  "score": <integer 0-100 representing ATS compatibility>,
                  "summary": "<2-3 sentence overall assessment>",
                  "matchedSkills": ["<skill1>", "<skill2>"],
                  "missingSkills": ["<skill1>", "<skill2>"],
                  "suggestions": [
                    "<specific actionable improvement 1>",
                    "<specific actionable improvement 2>",
                    "<specific actionable improvement 3>"
                  ],
                  "experienceFeedback": "<1-2 sentences on experience match>",
                  "educationFeedback": "<1-2 sentences on education match>"
                }
                
                Scoring guide:
                  90-100: Excellent match — nearly all requirements met
                  70-89:  Good match — most key requirements met
                  50-69:  Moderate match — some gaps exist
                  30-49:  Weak match — significant gaps
                  0-29:   Poor match — major mismatch
                
                RESUME:
                ---
                %s
                ---
                
                JOB DESCRIPTION:
                ---
                %s
                ---
                
                Return ONLY the JSON object. No markdown. No explanation.
                """.formatted(
                truncate(resumeText, 3000),   // stay within token limits
                truncate(jobDescription, 1500)
        );
    }

    /**
     * Parse Gemini's JSON string into ATSScoreResponse.
     *
     * Why try stripping markdown fences?
     *   Even with "Return ONLY JSON" in the prompt, Gemini
     *   occasionally wraps output in ```json ... ```.
     *   We strip these defensively before parsing.
     */
    private ATSScoreResponse parseATSResponse(String rawJson) {
        try {
            String cleaned = stripMarkdownFences(rawJson);
            return objectMapper.readValue(cleaned, ATSScoreResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse Gemini ATS response: {}", e.getMessage());
            log.error("Raw response was: {}", rawJson);
            throw new BadRequestException(
                    "AI returned an unexpected format. Please try again.");
        }
    }

    /**
     * Strip ```json ... ``` markdown fences if Gemini adds them.
     */
    private String stripMarkdownFences(String text) {
        if (text == null) return "";
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            // Remove opening fence (```json or ```)
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\n?", "");
            // Remove closing fence
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.lastIndexOf("```"));
            }
        }
        return trimmed.trim();
    }

    /**
     * Truncate text to maxChars to stay within Gemini token limits.
     * Adds a note if truncated so the AI knows the text was cut.
     */
    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        if (text.length() <= maxChars) return text;
        return text.substring(0, maxChars) + "\n[...truncated for length]";
    }
}