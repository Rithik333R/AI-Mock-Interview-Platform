package com.mockiq.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter — runs once per request, before controllers.
 *
 * What it does on every request:
 *   1. Read the Authorization header
 *   2. Extract the token (strip "Bearer ")
 *   3. Validate the token
 *   4. Load the user from DB
 *   5. Set authentication in Spring's SecurityContext
 *
 * After step 5, Spring Security knows WHO is making the request.
 * If no valid token is found, the request continues unauthenticated
 * (Spring Security will then block it if the endpoint requires auth).
 *
 * Extends OncePerRequestFilter → guaranteed to run exactly once
 * per request, even in async dispatch scenarios.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider    jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         filterChain)
            throws ServletException, IOException {

        try {
            String token = extractTokenFromRequest(request);

            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {

                // Extract email from token
                String email = jwtTokenProvider.extractEmail(token);

                // Load full user details from DB
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                /**
                 * Build an Authentication object and put it in the
                 * SecurityContext. From this point forward, any call to
                 * SecurityContextHolder.getContext().getAuthentication()
                 * returns this user — including in controllers and services.
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,                         // credentials (not needed post-auth)
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                log.debug("Authenticated user: {}", email);
            }

        } catch (Exception e) {
            // Don't block the request — let Spring Security handle it
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // Always continue the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Pull the token out of the Authorization header.
     * Expected format: "Bearer eyJhbGci..."
     * Returns just the token part, or null if header is missing/wrong format.
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Remove "Bearer " prefix
        }
        return null;
    }
}