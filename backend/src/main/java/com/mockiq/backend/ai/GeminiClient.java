package com.mockiq.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mockiq.backend.config.AppProperties;
import com.mockiq.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * GeminiClient — low-level HTTP wrapper for the Gemini 1.5 Flash API.
 *
 * Responsibilities:
 *   - Build the JSON request body Gemini expects
 *   - Send the HTTP POST with API key
 *   - Extract the text from the response
 *   - Retry once on transient failures (5xx)
 *   - Throw a clean exception on permanent failures
 *
 * Why Java HttpClient (not RestTemplate or WebClient)?
 *   HttpClient is built into Java 11+. No extra dependency.
 *   Simple, readable, and sufficient for synchronous AI calls.
 *
 * Free tier limits (Gemini 1.5 Flash):
 *   15 requests per minute
 *   1 million tokens per day
 *   We stay well within this for dev usage.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final AppProperties appProperties;
    private final ObjectMapper  objectMapper;

    // Single shared HttpClient — thread-safe, reuse across requests
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * Send a prompt to Gemini and return the raw text response.
     *
     * @param prompt the full prompt string (built by calling services)
     * @return raw text from Gemini's response
     */
    public String generate(String prompt) {
        AppProperties.Gemini config = appProperties.getGemini();

        // Build the URL: base-url?key=API_KEY
        String url = config.getBaseUrl() + "?key=" + config.getApiKey();

        // Build request body JSON
        String requestBody = buildRequestBody(prompt, config);

        log.debug("Sending request to Gemini API...");

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(45))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            int statusCode = response.statusCode();
            log.debug("Gemini API responded with status: {}", statusCode);

            // Retry once on server-side errors (5xx)
            if (statusCode >= 500) {
                log.warn("Gemini returned {}. Retrying once...", statusCode);
                Thread.sleep(1500);
                response = httpClient.send(request,
                        HttpResponse.BodyHandlers.ofString());
                statusCode = response.statusCode();
            }

            if (statusCode == 429) {
                throw new BadRequestException(
                        "AI service rate limit reached. Please wait a moment and try again.");
            }

            if (statusCode != 200) {
                log.error("Gemini API error {}: {}", statusCode, response.body());
                throw new BadRequestException(
                        "AI service is temporarily unavailable. Please try again later.");
            }

            return extractTextFromResponse(response.body());

        } catch (BadRequestException e) {
            throw e; // re-throw our own exceptions as-is
        } catch (Exception e) {
            log.error("Failed to call Gemini API: {}", e.getMessage(), e);
            throw new BadRequestException(
                    "Failed to reach AI service. Please check your connection and try again.");
        }
    }

    /**
     * Build the JSON body that Gemini's REST API expects.
     *
     * Gemini format:
     * {
     *   "contents": [{ "parts": [{ "text": "your prompt" }] }],
     *   "generationConfig": {
     *     "maxOutputTokens": 2048,
     *     "temperature": 0.3
     *   }
     * }
     *
     * temperature: 0.3 = more deterministic / factual responses.
     * Good for structured output like JSON.
     * (0.0 = fully deterministic, 1.0 = creative/random)
     */
    private String buildRequestBody(String prompt, AppProperties.Gemini config) {
        try {
            ObjectNode root = objectMapper.createObjectNode();

            // contents array
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            // generationConfig
            ObjectNode genConfig = root.putObject("generationConfig");
            genConfig.put("maxOutputTokens", config.getMaxOutputTokens());
            genConfig.put("temperature", config.getTemperature());

            // NOTE: responseMimeType removed — it can cause truncation
            // on Gemini 2.5 Flash. Prompt-level instruction ("return ONLY JSON")
            // is more reliable. stripMarkdownFences() handles any stray wrappers.

            return objectMapper.writeValueAsString(root);

        } catch (Exception e) {
            throw new BadRequestException("Failed to build AI request.");
        }
    }

    /**
     * Navigate the Gemini response JSON to extract the text content.
     *
     * Gemini response structure:
     * {
     *   "candidates": [{
     *     "content": {
     *       "parts": [{ "text": "...the AI's response..." }]
     *     },
     *     "finishReason": "STOP"   ← must be STOP, not MAX_TOKENS
     *   }]
     * }
     */
    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode root      = objectMapper.readTree(responseBody);
            JsonNode candidate = root.path("candidates").get(0);

            // Check finishReason — MAX_TOKENS means the response was cut off
            String finishReason = candidate.path("finishReason").asText("STOP");
            if ("MAX_TOKENS".equals(finishReason)) {
                log.error("Gemini response truncated (MAX_TOKENS hit). " +
                        "Increase max-output-tokens in application.yml. " +
                        "Raw: {}", responseBody);
                throw new BadRequestException(
                        "AI response was cut off due to length limits. " +
                                "Please try with a shorter resume or contact support.");
            }

            JsonNode text = candidate
                    .path("content")
                    .path("parts").get(0)
                    .path("text");

            if (text.isMissingNode() || text.isNull()) {
                log.error("Unexpected Gemini response shape: {}", responseBody);
                throw new BadRequestException(
                        "AI returned an unexpected response. Please try again.");
            }

            String extracted = text.asText();
            // Log first 200 chars so truncation is visible in dev logs
            log.debug("Gemini raw output (first 200 chars): {}",
                    extracted.substring(0, Math.min(200, extracted.length())));

            return extracted;

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new BadRequestException(
                    "Failed to parse AI response. Please try again.");
        }
    }
}