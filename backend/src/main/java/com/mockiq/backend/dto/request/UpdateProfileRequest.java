package com.mockiq.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * UpdateProfileRequest — payload for PUT /api/users/me
 *
 * Why only fullName?
 *   - Email changes need their own verification flow (send confirmation email)
 *   - Password changes need their own flow (current password + confirm new)
 *   - Role changes are admin-only
 *
 *   Each of those will get a dedicated endpoint later.
 *   This keeps profile updates simple and safe.
 */
@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
}