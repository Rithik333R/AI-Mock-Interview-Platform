package com.mockiq.backend.dto.response;

import com.mockiq.backend.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * UserResponse — the safe public representation of a User.
 *
 * What's included:  id, fullName, email, role, isActive, createdAt
 * What's excluded:  password (never exposed), updatedAt (internal)
 *
 * Static factory method fromEntity() keeps the mapping logic
 * in one place. If we add a field to User, we update it here once.
 */
@Getter
@Builder
public class UserResponse {

    private Long          id;
    private String        fullName;
    private String        email;
    private String        role;
    private Boolean       isActive;
    private LocalDateTime createdAt;

    /**
     * Convert a User entity to a UserResponse DTO.
     * Called in UserService — keeps controllers and services clean.
     */
    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}