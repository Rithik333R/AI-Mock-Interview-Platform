package com.mockiq.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * ApiResponse — the standard wrapper for every API response.
 *
 * Every endpoint returns this shape:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": { ... },        ← only present on success
 *   "timestamp": "2025-..."
 * }
 *
 * Why wrap responses?
 *   - Consistent shape — frontend always knows where to find data
 *   - Easier error handling — always check "success" first
 *   - "message" gives human-readable context alongside the HTTP status
 *
 * @JsonInclude(NON_NULL) → "data" field is omitted from JSON
 * when null (e.g. on error responses with no data).
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private T       data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // ── Static factory helpers ─────────────────────────────────────────

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}