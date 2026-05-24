package com.mockiq.backend.controller;

import com.mockiq.backend.config.SwaggerConstants;
import com.mockiq.backend.dto.request.LoginRequest;
import com.mockiq.backend.dto.request.RegisterRequest;
import com.mockiq.backend.dto.response.ApiResponse;
import com.mockiq.backend.dto.response.AuthResponse;
import com.mockiq.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = SwaggerConstants.TAG_AUTH, description = SwaggerConstants.DESC_AUTH)
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary     = "Register a new user",
            description = "Creates a new account and returns a JWT access token immediately. " +
                    "The user is logged in automatically after registration."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description  = "Registration successful",
                    content      = @Content(schema = @Schema(implementation = ApiResponse.class),
                            examples     = @ExampleObject(value = """
                            {
                              "success": true,
                              "message": "Registration successful",
                              "data": {
                                "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                                "tokenType": "Bearer",
                                "email": "john@example.com",
                                "fullName": "John Doe",
                                "role": "USER"
                              }
                            }
                            """))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description  = "Validation failed or email already registered"
            )
    })
    @SecurityRequirements   // override global auth — this endpoint needs NO token
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.debug("Register request for email: {}", request.getEmail());
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", authResponse));
    }

    @Operation(
            summary     = "Login",
            description = "Authenticates with email and password. Returns a JWT access token " +
                    "to use in the Authorization header for all protected endpoints."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description  = "Login successful",
                    content      = @Content(schema = @Schema(implementation = ApiResponse.class),
                            examples     = @ExampleObject(value = """
                            {
                              "success": true,
                              "message": "Login successful",
                              "data": {
                                "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                                "tokenType": "Bearer",
                                "email": "john@example.com",
                                "fullName": "John Doe",
                                "role": "USER"
                              }
                            }
                            """))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description  = "Invalid email or password"
            )
    })
    @SecurityRequirements   // no token needed to login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.debug("Login request for email: {}", request.getEmail());
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
}