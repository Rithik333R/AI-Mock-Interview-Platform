package com.mockiq.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * InterviewFeedbackAI — evaluates one user answer via Gemini.
 *
 * Scores three dimensions independently (each 0–10):
 *   Clarity    → is the answer well-structured and easy to follow?
 *   Relevance  → does it directly answer what was asked?
 *   Depth      → is there sufficient technical or experiential depth?
 *
 * Also returns:
 *   aiFeedback      → 2-3 sentence overall assessment
 *   improvementTips → 2-3 specific, actionable suggestions
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InterviewFeedbackAI {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    /**
     * Evaluate the user's answer and return structured feedback.
     *
     * @param questionText   the interview question that was asked
     * @param expectedAnswer the ideal answer outline (for AI reference)
     * @param userAnswer     what the user actually wrote
     * @return FeedbackResult with scores and improvement tips
     */
    public FeedbackResult evaluateAnswer(String questionText,
                                         String expectedAnswer,
                                         String userAnswer) {
        String prompt = buildPrompt(questionText, expectedAnswer, userAnswer);

        log.debug("Evaluating answer for question: {}...",
                questionText.substring(0, Math.min(60, questionText.length())));

        String rawJson = geminiClient.generate(prompt);
        return parseFeedback(rawJson);
    }

    private String buildPrompt(String questionText,
                               String expectedAnswer,
                               String userAnswer) {
        return """
                You are an expert technical interviewer providing structured feedback.

                Evaluate the candidate's answer to the interview question below.
                Score each dimension from 0 to 10 using the guide provided.
                Return ONLY a valid JSON object. No markdown. No extra text.

                QUESTION:
                %s

                IDEAL ANSWER OUTLINE (for reference):
                %s

                CANDIDATE'S ANSWER:
                %s

                Scoring guide (0-10 per dimension):
                  9-10: Exceptional — exceeds expectations significantly
                  7-8:  Good — meets expectations with minor gaps
                  5-6:  Adequate — partially meets expectations
                  3-4:  Weak — significant gaps
                  0-2:  Poor — does not address the question

                Required JSON structure:
                {
                  "clarityScore": <integer 0-10>,
                  "relevanceScore": <integer 0-10>,
                  "depthScore": <integer 0-10>,
                  "aiFeedback": "<2-3 sentence overall assessment of the answer>",
                  "improvementTips": "<tip 1>\\n<tip 2>\\n<tip 3>"
                }

                Rules:
                - All scores must be integers between 0 and 10
                - aiFeedback must be constructive and specific
                - improvementTips must be specific and actionable — not generic
                - If the answer is blank or off-topic, score all dimensions 0-2
                - Return ONLY the JSON object. No markdown. No extra text.
                """.formatted(
                questionText,
                expectedAnswer != null ? expectedAnswer : "No reference provided",
                truncate(userAnswer, 2000)
        );
    }

    private FeedbackResult parseFeedback(String rawJson) {
        try {
            String   cleaned  = stripMarkdownFences(rawJson);
            JsonNode node     = objectMapper.readTree(cleaned);

            int    clarity    = clamp(node.path("clarityScore").asInt(5));
            int    relevance  = clamp(node.path("relevanceScore").asInt(5));
            int    depth      = clamp(node.path("depthScore").asInt(5));
            String feedback   = node.path("aiFeedback").asText("");
            String tips       = node.path("improvementTips").asText("");

            double overall = (clarity + relevance + depth) / 3.0;

            return new FeedbackResult(clarity, relevance, depth,
                    overall, feedback, tips);

        } catch (Exception e) {
            log.error("Failed to parse Gemini feedback: {}", e.getMessage());
            throw new BadRequestException(
                    "Failed to parse AI feedback. Please try again.");
        }
    }

    /** Clamp score to valid range 0-10 in case AI hallucinates out-of-range values */
    private int clamp(int value) {
        return Math.max(0, Math.min(10, value));
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return "";
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\n?", "");
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.lastIndexOf("```"));
            }
        }
        return trimmed.trim();
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() <= maxChars
                ? text
                : text.substring(0, maxChars) + "\n[...truncated]";
    }

    /**
     * Value object carrying all feedback data from Gemini.
     * Passed from this AI class into InterviewService.
     */
    public record FeedbackResult(
            int    clarityScore,
            int    relevanceScore,
            int    depthScore,
            double overallScore,
            String aiFeedback,
            String improvementTips
    ) {}
}