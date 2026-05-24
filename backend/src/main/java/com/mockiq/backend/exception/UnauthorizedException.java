package com.mockiq.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * UnauthorizedException — thrown when a user tries to access
 * a resource that belongs to someone else.
 *
 * Example:
 *   - User A tries to fetch User B's resume
 *
 * Note: 401 vs 403 distinction:
 *   401 Unauthorized = not authenticated (no/bad token)
 *   403 Forbidden     = authenticated but not allowed
 * We use 403 here because the user IS logged in, just not permitted.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}