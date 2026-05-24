package com.mockiq.backend.config;

import com.mockiq.backend.security.JwtAuthenticationFilter;
import com.mockiq.backend.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig — the real, permanent security configuration.
 * Replaces the temporary Phase 0 version.
 *
 * Key decisions:
 *   - STATELESS sessions: we never store session on the server.
 *     Every request must carry a JWT. This makes the backend
 *     horizontally scalable (no sticky sessions needed).
 *   - CSRF disabled: CSRF attacks require cookies. We use
 *     Authorization headers, so CSRF doesn't apply.
 *   - BCrypt: industry standard for password hashing.
 *     Cost factor 12 = ~300ms per hash (slow enough to deter brute force).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl  userDetailsService;

    /**
     * Public endpoints — no JWT required.
     * Everything else requires a valid token.
     */
    private static final String[] PUBLIC_URLS = {
            "/api/auth/**",      // register, login
            "/api/health",       // health check
            "/v3/api-docs/**",   // OpenAPI JSON spec
            "/swagger-ui/**",    // Swagger UI static assets
            "/swagger-ui.html"   // Swagger UI entry point
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_URLS).permitAll()
                        .anyRequest().authenticated()
                )

                // Stateless — no HttpSession, no cookies
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Use our DaoAuthenticationProvider
                .authenticationProvider(authenticationProvider())

                // Run our JWT filter before Spring's username/password filter
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * PasswordEncoder — BCrypt with strength 12.
     * @Bean makes it injectable anywhere in the app.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * AuthenticationProvider — tells Spring Security how to:
     *   1. Load the user (via UserDetailsService)
     *   2. Verify the password (via PasswordEncoder)
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager — used in AuthService to trigger
     * the actual login (email + password) verification.
     * Spring Boot auto-configures this; we just expose it as a bean.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}