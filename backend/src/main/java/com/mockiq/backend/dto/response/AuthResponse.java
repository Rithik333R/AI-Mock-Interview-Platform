package com.mockiq.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * AuthResponse — returned after successful register or login.
 *
 * Contains:
 *   accessToken → the JWT the client must send in every future request
 *   tokenType   → always "Bearer" — tells client how to send the token
 *   email       → confirms which account was authenticated
 *   fullName    → so the frontend can display "Welcome, John"
 *
 * We deliberately do NOT return the User entity —
 * that would expose the hashed password and internal fields.
 */
@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private String email;
    private String fullName;
    private String role;
}