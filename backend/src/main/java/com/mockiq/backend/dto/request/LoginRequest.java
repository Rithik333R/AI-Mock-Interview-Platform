package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * LoginRequest — payload for POST /api/auth/login.
 *
 * Kept intentionally minimal — we only need email and password.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}