package com.mockiq.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * RoadmapGeneratorAI — generates a week-by-week learning plan via Gemini.
 *
 * Input:  missing skills list + target role + readiness score
 * Output: RoadmapResult containing:
 *   - totalWeeks   (how long the plan runs)
 *   - milestones   (list of Milestone objects, one per week/topic)
 *   - summary      (overall plan description)
 *
 * Each Milestone:
 *   id          → sequential integer (used for completion tracking)
 *   weekNumber  → which week to tackle this
 *   title       → short label for the milestone
 *   description → what to learn and why
 *   skills      → specific skills covered in this milestone
 *   resources   → concrete learning resources (books, URLs, courses)
 *   completed   → always false on creation; user flips this later
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoadmapGeneratorAI {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    /**
     * Generate a personalised learning roadmap.
     *
     * @param missingSkills  list of skills the user needs to acquire
     * @param targetRole     the job role they are aiming for
     * @param readinessScore current readiness (0–100) — affects plan intensity
     */
    public RoadmapResult generate(List<String> missingSkills,
                                  String targetRole,
                                  int readinessScore) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            throw new BadRequestException(
                    "No missing skills found. Your resume already covers " +
                            "the required skills for this role.");
        }

        String prompt = buildPrompt(missingSkills, targetRole, readinessScore);

        log.info("Calling Gemini for roadmap — role: {}, missing skills: {}",
                targetRole, missingSkills.size());

        String rawJson = geminiClient.generate(prompt);
        return parseResult(rawJson);
    }

    private String buildPrompt(List<String> missingSkills,
                               String targetRole,
                               int readinessScore) {
        String intensity = readinessScore >= 70
                ? "The learner is nearly ready — focus on depth and projects."
                : readinessScore >= 40
                ? "The learner has a foundation — balance breadth and depth."
                : "The learner is starting from scratch on many skills — "
                + "start with fundamentals and build progressively.";

        return """
                You are an expert technical learning coach creating a personalised study roadmap.

                Create a week-by-week learning plan to help the candidate become a %s.
                Current readiness score: %d/100. %s

                Skills to learn:
                %s

                Return ONLY a valid JSON object. No markdown. No extra text.

                Required JSON structure:
                {
                  "totalWeeks": <integer — total duration of the plan>,
                  "summary": "<2-3 sentence overview of the plan>",
                  "milestones": [
                    {
                      "id": 1,
                      "weekNumber": 1,
                      "title": "<short milestone title>",
                      "description": "<what to learn and why — 2-3 sentences>",
                      "skills": ["<skill1>", "<skill2>"],
                      "resources": [
                        "<specific book title or URL>",
                        "<specific course name and platform>"
                      ],
                      "completed": false
                    }
                  ]
                }

                Rules:
                - Each milestone covers 1-2 skills maximum — keep it focused
                - totalWeeks must equal the highest weekNumber in milestones
                - resources must be SPECIFIC: real book titles, real URLs,
                  real course names on Udemy/Coursera/YouTube — not generic advice
                - description must explain what to build or practise, not just read
                - Order milestones from foundational to advanced
                - completed must always be false in the generated plan
                - Return ONLY the JSON object. No markdown. No extra text.
                """.formatted(
                targetRole,
                readinessScore,
                intensity,
                String.join(", ", missingSkills)
        );
    }

    private RoadmapResult parseResult(String rawJson) {
        try {
            String   cleaned = stripMarkdownFences(rawJson);
            JsonNode node    = objectMapper.readTree(cleaned);

            int    totalWeeks = node.path("totalWeeks").asInt(4);
            String summary    = node.path("summary").asText("");

            List<Milestone> milestones = new ArrayList<>();
            JsonNode milestonesNode = node.path("milestones");

            if (milestonesNode.isArray()) {
                for (JsonNode m : milestonesNode) {
                    List<String> skills    = parseStringArray(m.path("skills"));
                    List<String> resources = parseStringArray(m.path("resources"));

                    milestones.add(new Milestone(
                            m.path("id").asInt(milestones.size() + 1),
                            m.path("weekNumber").asInt(1),
                            m.path("title").asText(""),
                            m.path("description").asText(""),
                            skills,
                            resources,
                            false   // always start as not completed
                    ));
                }
            }

            if (milestones.isEmpty()) {
                throw new BadRequestException(
                        "AI returned no milestones. Please try again.");
            }

            log.info("Roadmap parsed — {} weeks, {} milestones",
                    totalWeeks, milestones.size());

            return new RoadmapResult(totalWeeks, summary, milestones);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse roadmap response: {}", e.getMessage());
            throw new BadRequestException(
                    "Failed to parse AI roadmap. Please try again.");
        }
    }

    private List<String> parseStringArray(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(item -> {
                String val = item.asText("").trim();
                if (!val.isBlank()) list.add(val);
            });
        }
        return list;
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return "";
        String t = text.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("^```[a-zA-Z]*\\n?", "");
            if (t.endsWith("```")) t = t.substring(0, t.lastIndexOf("```"));
        }
        return t.trim();
    }

    // ── Value objects ──────────────────────────────────────────────────

    public record RoadmapResult(
            int            totalWeeks,
            String         summary,
            List<Milestone> milestones
    ) {}

    public record Milestone(
            int          id,
            int          weekNumber,
            String       title,
            String       description,
            List<String> skills,
            List<String> resources,
            boolean      completed
    ) {}
}