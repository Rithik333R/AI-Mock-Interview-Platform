package com.mockiq.backend.repository;

import com.mockiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository — data access layer for the User entity.
 *
 * Extending JpaRepository<User, Long> gives us these for free:
 *   save(), findById(), findAll(), deleteById(), count() … and more.
 *
 * We only need to declare methods that aren't already provided.
 * Spring Data JPA reads the method name and generates the SQL:
 *   findByEmail → SELECT * FROM users WHERE email = ?
 *   existsByEmail → SELECT COUNT(*) > 0 FROM users WHERE email = ?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * Used during login to load the user for authentication.
     *
     * Returns Optional so callers are forced to handle "not found"
     * instead of getting a NullPointerException.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with this email already exists.
     * Used during registration to prevent duplicate accounts.
     */
    boolean existsByEmail(String email);
}