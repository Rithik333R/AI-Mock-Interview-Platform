package com.mockiq.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ResourceNotFoundException — thrown when something expected is not in the DB.
 *
 * Examples:
 *   - User with id 99 does not exist
 *   - Resume with id 5 not found
 *
 * @ResponseStatus(404) is a hint but we handle it explicitly
 * in GlobalExceptionHandler for a consistent response shape.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Convenience constructor: "User not found with id: 5"
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: %s", resource, field, value));
    }
}