package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * User — the core identity entity.
 *
 * Maps to the "users" table in MySQL.
 * Extends BaseEntity for id, createdAt, updatedAt.
 *
 * Why @Table(name = "users")?
 *   "user" is a reserved keyword in MySQL — naming it explicitly
 *   avoids a SQL syntax error at startup.
 *
 * Why implement nothing yet?
 *   Spring Security integration (UserDetails) will be handled
 *   in UserDetailsServiceImpl — keeps this entity clean.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email", name = "uk_users_email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Always stored as a BCrypt hash — never plain text.
     * Length 255 covers BCrypt's 60-char output with room to grow.
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    /**
     * Role stored as a String in the DB column (e.g. "USER", "ADMIN").
     * EnumType.STRING is safer than ORDINAL —
     * ORDINAL breaks if you ever reorder the enum values.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    /**
     * Soft delete flag.
     * We never hard-delete users — we just mark them inactive.
     * This preserves interview history and audit trails.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}