package com.mockiq.backend.service;

import com.mockiq.backend.dto.request.LoginRequest;
import com.mockiq.backend.dto.request.RegisterRequest;
import com.mockiq.backend.dto.response.AuthResponse;
import com.mockiq.backend.entity.Role;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.repository.UserRepository;
import com.mockiq.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService — handles register and login business logic.
 *
 * Why @Transactional on register?
 *   If the save succeeds but something else fails after it,
 *   @Transactional rolls back the DB insert automatically.
 *   Keeps the DB consistent.
 *
 * Why NOT @Transactional on login?
 *   Login only reads data (via AuthenticationManager).
 *   No writes, so no transaction needed.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JwtTokenProvider    jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user.
     *
     * Steps:
     *   1. Check the email isn't already taken
     *   2. Hash the password (never store plain text)
     *   3. Save the new user to DB
     *   4. Generate and return a JWT (user is logged in immediately)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // 1. Duplicate email check
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "An account with this email already exists: " + request.getEmail());
        }

        // 2. Build and save the user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());

        // 3. Generate token and return
        String token = jwtTokenProvider.generateAccessToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    /**
     * Login an existing user.
     *
     * Steps:
     *   1. AuthenticationManager verifies email + password
     *      (calls UserDetailsServiceImpl.loadUserByUsername internally)
     *   2. If wrong credentials → throws BadCredentialsException automatically
     *   3. If correct → generate and return a JWT
     */
    public AuthResponse login(LoginRequest request) {

        // 1. Authenticate — throws exception if credentials are wrong
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        // 2. Load the user entity for the response body
        User user = userRepository.findByEmail(
                        request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        log.info("User logged in: {}", user.getEmail());

        // 3. Generate token
        String token = jwtTokenProvider.generateAccessToken(authentication);

        return AuthResponse.builder()
                .accessToken(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}