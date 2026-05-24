package com.mockiq.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SkillGapAnalyzerAI — compares resume skills to a target role via Gemini.
 *
 * Input:  resume extracted text + target role name
 * Output: SkillGapResult containing:
 *   - currentSkills    (skills found in resume)
 *   - missingSkills    (required for role, not found in resume)
 *   - proficiencyMap   (skill → level: BEGINNER/INTERMEDIATE/ADVANCED/NOT_STARTED)
 *   - readinessScore   (0–100)
 *   - summary          (2-3 sentence assessment)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SkillGapAnalyzerAI {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    /**
     * Analyse the gap between the resume and the target role.
     */
    public SkillGapResult analyze(String resumeText, String targetRole) {
        String prompt = buildPrompt(resumeText, targetRole);

        log.info("Calling Gemini for skill gap analysis — role: {}", targetRole);

        String rawJson = geminiClient.generate(prompt);
        return parseResult(rawJson);
    }

    private String buildPrompt(String resumeText, String targetRole) {
        return """
                You are an expert technical career coach and skills assessor.

                Analyse the resume below and identify the skill gaps for the target role.
                Return ONLY a valid JSON object. No markdown. No extra text.

                TARGET ROLE: %s

                RESUME TEXT:
                ---
                %s
                ---

                Required JSON structure:
                {
                  "currentSkills": ["<skill1>", "<skill2>"],
                  "missingSkills": ["<skill1>", "<skill2>"],
                  "proficiencyMap": {
                    "<skill>": "<BEGINNER|INTERMEDIATE|ADVANCED|NOT_STARTED>"
                  },
                  "readinessScore": <integer 0-100>,
                  "summary": "<2-3 sentence overall assessment>"
                }

                Rules:
                - currentSkills: top 15 most relevant technical and soft skills
                  found in the resume — do NOT list every single technology mentioned
                - missingSkills: top 10 most important skills required for the
                  target role that are NOT present in the resume
                - proficiencyMap: include ONLY the skills from currentSkills and
                  missingSkills — maximum 25 entries total.
                  Use NOT_STARTED for missing skills.
                - readinessScore: holistic 0-100 score.
                  90-100 = role-ready, 70-89 = nearly ready,
                  50-69 = partial, 30-49 = significant gaps, 0-29 = major mismatch
                - summary: constructive and specific — 2-3 sentences maximum
                - Return ONLY the JSON object. No markdown. No extra text.
                """.formatted(targetRole, truncate(resumeText, 2500));
    }

    private SkillGapResult parseResult(String rawJson) {
        try {
            String   cleaned = stripMarkdownFences(rawJson);
            JsonNode node    = objectMapper.readTree(cleaned);

            List<String> currentSkills = parseStringArray(
                    node.path("currentSkills"));
            List<String> missingSkills = parseStringArray(
                    node.path("missingSkills"));

            // Parse proficiencyMap: { "Java": "ADVANCED", ... }
            Map<String, String> proficiencyMap = new HashMap<>();
            JsonNode mapNode = node.path("proficiencyMap");
            if (mapNode.isObject()) {
                mapNode.fields().forEachRemaining(entry ->
                        proficiencyMap.put(entry.getKey(),
                                entry.getValue().asText("NOT_STARTED")));
            }

            int    readinessScore = Math.max(0,
                    Math.min(100, node.path("readinessScore").asInt(50)));
            String summary        = node.path("summary").asText("");

            log.info("Skill gap parsed — readiness: {}%, current: {}, missing: {}",
                    readinessScore, currentSkills.size(), missingSkills.size());

            return new SkillGapResult(
                    currentSkills, missingSkills,
                    proficiencyMap, readinessScore, summary);

        } catch (Exception e) {
            log.error("Failed to parse skill gap response: {}", e.getMessage());
            throw new BadRequestException(
                    "Failed to parse AI skill gap analysis. Please try again.");
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

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() <= maxChars
                ? text
                : text.substring(0, maxChars) + "\n[...truncated]";
    }

    /**
     * Value object carrying the full skill gap result from Gemini.
     */
    public record SkillGapResult(
            List<String>        currentSkills,
            List<String>        missingSkills,
            Map<String, String> proficiencyMap,
            int                 readinessScore,
            String              summary
    ) {}
}