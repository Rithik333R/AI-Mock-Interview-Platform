package com.mockiq.backend.entity;

/**
 * Role — defines what a user is allowed to do.
 *
 * Spring Security expects roles to be prefixed with "ROLE_"
 * when used with hasRole(). We store the name without the prefix
 * and Spring adds it automatically.
 *
 * USER  → regular platform user
 * ADMIN → platform administrator (future use)
 */
public enum Role {
    USER,
    ADMIN
}