package com.mockiq.backend.security;

import com.mockiq.backend.entity.User;
import com.mockiq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * UserDetailsServiceImpl — loads a User from the DB for Spring Security.
 *
 * Spring Security calls loadUserByUsername() automatically during:
 *   1. Form login (not used here — we use JWT)
 *   2. Our JwtAuthenticationFilter when it sets the SecurityContext
 *
 * The "username" in Spring Security = email in our system.
 *
 * @Transactional(readOnly = true) — opens a read-only DB transaction
 * just for the duration of this method. Best practice for reads.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException(
                            "User not found with email: " + email);
                });

        /**
         * Convert our Role enum to a Spring Security GrantedAuthority.
         * Spring Security expects the format "ROLE_USER" or "ROLE_ADMIN".
         * SimpleGrantedAuthority("ROLE_" + role) does that conversion.
         *
         * This is what .hasRole("USER") checks against in SecurityConfig.
         */
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        /**
         * Spring's built-in User (not our entity) implements UserDetails.
         * We pass it: email, hashed password, and authorities.
         * Spring Security uses this to validate credentials.
         */
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getIsActive(),   // enabled
                true,                 // accountNonExpired
                true,                 // credentialsNonExpired
                true,                 // accountNonLocked
                authorities
        );
    }
}