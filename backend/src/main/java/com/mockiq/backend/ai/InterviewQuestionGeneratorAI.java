package com.mockiq.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.entity.Interview.Difficulty;
import com.mockiq.backend.entity.InterviewQuestion.QuestionCategory;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * InterviewQuestionGeneratorAI — generates interview questions via Gemini.
 *
 * Output: a typed list of GeneratedQuestion records, each containing
 * the question text, expected answer outline, and category.
 *
 * Question mix per session (5 total):
 *   EASY   → 2 TECHNICAL, 2 BEHAVIOURAL, 1 SITUATIONAL
 *   MEDIUM → 3 TECHNICAL, 1 BEHAVIOURAL, 1 SITUATIONAL
 *   HARD   → 3 TECHNICAL, 1 SITUATIONAL, 1 HR
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InterviewQuestionGeneratorAI {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    /**
     * Generate 5 interview questions for the given role and difficulty.
     *
     * @param targetRole the job role (e.g. "Java Backend Developer")
     * @param difficulty EASY / MEDIUM / HARD
     * @return list of exactly 5 GeneratedQuestion objects
     */
    public List<GeneratedQuestion> generateQuestions(String targetRole,
                                                     Difficulty difficulty) {
        String prompt = buildPrompt(targetRole, difficulty);

        log.info("Generating questions for role='{}', difficulty='{}'",
                targetRole, difficulty);

        String rawJson = geminiClient.generate(prompt);
        return parseQuestions(rawJson);
    }

    private String buildPrompt(String targetRole, Difficulty difficulty) {
        String difficultyGuide = switch (difficulty) {
            case EASY -> """
                    - Focus on fundamental concepts and basic experience questions
                    - BEHAVIOURAL: situational questions about teamwork and communication
                    - TECHNICAL: core language/framework basics, no system design
                    """;
            case MEDIUM -> """
                    - Mix of applied knowledge and problem-solving
                    - TECHNICAL: include one system design or architecture question
                    - BEHAVIOURAL: questions about handling challenges and ownership
                    """;
            case HARD -> """
                    - Advanced technical depth expected
                    - TECHNICAL: include system design, scalability, trade-offs
                    - SITUATIONAL: complex real-world engineering scenarios
                    - HR: salary expectations, leadership, career trajectory
                    """;
        };

        return """
                You are a senior technical interviewer at a top technology company.
                Generate exactly 5 interview questions for the following role and difficulty.

                Role: %s
                Difficulty: %s

                Difficulty guidance:
                %s

                Return ONLY a valid JSON array with exactly 5 objects.
                Do not include any explanation, markdown, or text outside the JSON.

                Required JSON structure:
                [
                  {
                    "questionText": "<the interview question>",
                    "expectedAnswer": "<2-4 sentence outline of an ideal answer>",
                    "category": "<one of: TECHNICAL, BEHAVIOURAL, SITUATIONAL, HR>"
                  }
                ]

                Rules:
                - Every question must be specific to the role provided
                - expectedAnswer must be a concise outline, not a full answer
                - category must be exactly one of: TECHNICAL, BEHAVIOURAL, SITUATIONAL, HR
                - Return ONLY the JSON array. No markdown. No extra text.
                """.formatted(targetRole, difficulty.name(), difficultyGuide);
    }

    /**
     * Parse the JSON array Gemini returns into typed GeneratedQuestion objects.
     */
    private List<GeneratedQuestion> parseQuestions(String rawJson) {
        try {
            String cleaned = stripMarkdownFences(rawJson);
            JsonNode array  = objectMapper.readTree(cleaned);

            if (!array.isArray()) {
                throw new BadRequestException(
                        "AI returned unexpected format for questions.");
            }

            List<GeneratedQuestion> questions = new ArrayList<>();
            int sequence = 1;

            for (JsonNode node : array) {
                String questionText   = node.path("questionText").asText();
                String expectedAnswer = node.path("expectedAnswer").asText();
                String categoryStr    = node.path("category").asText("TECHNICAL");

                QuestionCategory category;
                try {
                    category = QuestionCategory.valueOf(categoryStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Unknown category '{}' — defaulting to TECHNICAL",
                            categoryStr);
                    category = QuestionCategory.TECHNICAL;
                }

                questions.add(new GeneratedQuestion(
                        questionText, expectedAnswer, category, sequence++));
            }

            if (questions.isEmpty()) {
                throw new BadRequestException(
                        "AI returned no questions. Please try again.");
            }

            log.info("Successfully parsed {} questions from Gemini",
                    questions.size());
            return questions;

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini questions response: {}",
                    e.getMessage());
            throw new BadRequestException(
                    "Failed to parse AI questions. Please try again.");
        }
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

    /**
     * Value object carrying one AI-generated question.
     * Used internally between the AI class and InterviewService.
     */
    public record GeneratedQuestion(
            String           questionText,
            String           expectedAnswer,
            QuestionCategory category,
            int              sequenceNumber
    ) {}
}