package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * RegisterRequest — payload for POST /api/auth/register.
 *
 * @NotBlank  → field cannot be null, empty, or whitespace-only
 * @Email     → must be a valid email format
 * @Size      → enforces min/max character length
 *
 * Validation is triggered by @Valid in the controller method.
 * If any constraint fails, Spring returns a 400 automatically
 * (we'll add a nice error format in the exception handler later).
 */
@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;
}