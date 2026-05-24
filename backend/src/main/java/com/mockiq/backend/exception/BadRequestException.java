package com.mockiq.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * BadRequestException — thrown when the request is valid JSON
 * but fails business rules.
 *
 * Examples:
 *   - Email already registered
 *   - Trying to submit an answer to a completed interview
 *
 * Different from validation errors (@Valid) which are 400s too,
 * but caught separately to show field-level detail.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}