package com.mockiq.backend.exception;

import com.mockiq.backend.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler — catches every exception thrown in the app
 * and converts it to a consistent ApiResponse JSON shape.
 *
 * Without this:
 *   - Validation failure → Spring's ugly default 400 with no detail
 *   - RuntimeException  → 500 with a stack trace leaked to the client
 *
 * With this:
 *   - Every error looks the same: { success, message, data, timestamp }
 *   - HTTP status codes are set correctly per exception type
 *   - Stack traces stay in logs, never reach the client
 *
 * Handler priority: most specific exception type is matched first.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles @Valid / @Validated failures.
     *
     * When a request body fails bean validation (e.g. blank email,
     * short password), Spring throws MethodArgumentNotValidException.
     *
     * We extract each field error and return them all in "data"
     * so the frontend can highlight the exact fields:
     *
     * {
     *   "success": false,
     *   "message": "Validation failed",
     *   "data": {
     *     "email": "must be a valid email",
     *     "password": "must be at least 8 characters"
     *   }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        log.warn("Validation failed: {}", fieldErrors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(fieldErrors)
                        .build());
    }

    /**
     * Handles our custom ResourceNotFoundException → 404
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        log.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles our custom BadRequestException → 400
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
            BadRequestException ex) {

        log.warn("Bad request: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles our custom UnauthorizedException → 403
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorizedException(
            UnauthorizedException ex) {

        log.warn("Unauthorized access: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles wrong email/password during login → 401
     *
     * Spring Security throws BadCredentialsException when
     * AuthenticationManager.authenticate() fails.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(
            BadCredentialsException ex) {

        log.warn("Bad credentials attempt");

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    /**
     * Handles login attempt by a disabled/inactive account → 403
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabledException(
            DisabledException ex) {

        log.warn("Disabled account login attempt");

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Your account has been deactivated. Please contact support."));
    }

    /**
     * Handles IllegalArgumentException (e.g. duplicate email in AuthService) → 400
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        log.warn("Illegal argument: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Catch-all handler — any unhandled exception → 500
     *
     * IMPORTANT: we log the full stack trace here for debugging,
     * but we NEVER send it to the client. The client gets a generic message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {

        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "An unexpected error occurred. Please try again later."));
    }
}