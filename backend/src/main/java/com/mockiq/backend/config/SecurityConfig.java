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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig — JWT security + CORS configuration.
 *
 * CORS fix (F15):
 *   Replaced missing/broken CORS setup with a proper
 *   CorsConfigurationSource bean. This is the ONLY correct
 *   way to configure CORS with Spring Security — putting it
 *   in a @CrossOrigin annotation or a WebMvcConfigurer is
 *   NOT enough when Spring Security is present because the
 *   security filter chain intercepts requests before MVC.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl  userDetailsService;

    private static final String[] PUBLIC_URLS = {
            "/api/auth/**",
            "/api/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Apply our CORS config — MUST be before csrf disable
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_URLS).permitAll()
                        .anyRequest().authenticated()
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * corsConfigurationSource — defines which origins, methods,
     * and headers are allowed.
     *
     * Local dev:  http://localhost:3000 and http://localhost:5173
     * Production: set CORS_ALLOWED_ORIGINS env var in Render
     *             e.g. https://mockiq.vercel.app
     *
     * Why not use @CrossOrigin on controllers?
     *   Spring Security's filter chain runs BEFORE Spring MVC.
     *   A preflight OPTIONS request hits Security first and gets
     *   rejected before @CrossOrigin ever sees it.
     *   The CorsConfigurationSource bean registered here runs
     *   inside the security chain — the correct approach.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Read allowed origins from environment variable.
        // Falls back to localhost for local development.
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");

        if (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank()) {
            // Production: split comma-separated list from env var
            // e.g. "https://mockiq.vercel.app,https://www.mockiq.vercel.app"
            List<String> origins = Arrays.stream(allowedOriginsEnv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();;
            config.setAllowedOrigins(origins);
        } else {
            // Local development fallback
            config.setAllowedOrigins(List.of(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173"
            ));
        }

        // Allow all standard HTTP methods
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Allow all headers — required for Authorization: Bearer token
        config.setAllowedHeaders(List.of("*"));

        // Allow credentials — required for Authorization header
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour (3600 seconds)
        // Reduces number of OPTIONS preflight requests
        config.setMaxAge(3600L);

        // Apply this config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}