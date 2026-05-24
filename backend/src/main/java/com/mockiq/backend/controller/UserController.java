package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.UpdateProfileRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.UserResponse;
import com.mockiq.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_USER, description = SwaggerConstants.DESC_USER)
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(
            summary     = "Get my profile",
            description = "Returns the full profile of the currently authenticated user."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Profile fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        UserResponse userResponse = userService.getMyProfile();
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched successfully", userResponse));
    }

    @Operation(
            summary     = "Update my profile",
            description = "Updates the full name of the currently authenticated user."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updatedUser = userService.updateMyProfile(request);
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", updatedUser));
    }
}