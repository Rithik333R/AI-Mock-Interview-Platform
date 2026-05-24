package com.mockiq.backend.service;

import com.mockiq.backend.dto.request.UpdateProfileRequest;
import com.mockiq.backend.dto.response.UserResponse;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UserService — handles user profile operations.
 *
 * Key method: getCurrentUser()
 *   This is used not just here, but will be called from
 *   ResumeService, InterviewService, etc. in future phases
 *   to find out WHO is making the request.
 *
 *   It reads from the SecurityContext — which was populated
 *   by JwtAuthenticationFilter on this exact request.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated User entity.
     *
     * Flow:
     *   1. JwtAuthenticationFilter runs → sets Authentication in SecurityContext
     *   2. This method reads that Authentication → gets the email
     *   3. Loads the full User entity from DB by email
     *
     * Why not pass the User around directly?
     *   The SecurityContext is request-scoped and thread-safe.
     *   Any service can call this without needing the controller
     *   to pass a user parameter through every method call.
     */
    public User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName(); // getName() = the JWT subject = email

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "email", email));
    }

    /**
     * GET /api/users/me
     * Returns the profile of the currently logged-in user.
     */
    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {
        User currentUser = getCurrentUser();
        log.debug("Fetching profile for user: {}", currentUser.getEmail());
        return UserResponse.fromEntity(currentUser);
    }

    /**
     * PUT /api/users/me
     * Updates the full name of the currently logged-in user.
     *
     * @Transactional — because we're writing to the DB.
     * JPA dirty checking: once we call setFullName() on a
     * managed entity inside a transaction, Hibernate automatically
     * issues an UPDATE when the transaction commits.
     * We don't need to call userRepository.save() explicitly
     * (though calling it is fine too and makes intent clearer).
     */
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        User currentUser = getCurrentUser();

        log.debug("Updating profile for user: {}", currentUser.getEmail());

        currentUser.setFullName(request.getFullName());

        // save() is explicit here for clarity — works with or without it
        // inside a @Transactional method due to dirty checking
        User updatedUser = userRepository.save(currentUser);

        return UserResponse.fromEntity(updatedUser);
    }
}