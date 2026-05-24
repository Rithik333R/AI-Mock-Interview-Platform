package com.mockiq.backend.security;

import com.mockiq.backend.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtTokenProvider — the single source of truth for all JWT operations.
 *
 * Responsibilities:
 *   1. Generate an access token from an authenticated user
 *   2. Extract the email (subject) from a token
 *   3. Validate a token (signature + expiry)
 *
 * We use JJWT library (already included via spring-boot-starter-security
 * transitive deps — we will add it explicitly to pom.xml in this step).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final AppProperties appProperties;

    /**
     * Build the signing key from the secret string in application.yml.
     * Keys.hmacShaKeyFor ensures it meets the minimum length for HS256.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = appProperties.getJwt()
                .getSecret()
                .getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate a JWT access token for an authenticated user.
     *
     * The token contains:
     *   subject  → user's email (used to reload the user on each request)
     *   issuedAt → now
     *   expiry   → now + accessTokenExpiryMs from config
     */
    public String generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return buildToken(userDetails.getUsername(),
                appProperties.getJwt().getAccessTokenExpiryMs());
    }

    /**
     * Overload: generate token directly from email string.
     * Used internally after registration so we can return a token immediately.
     */
    public String generateAccessToken(String email) {
        return buildToken(email, appProperties.getJwt().getAccessTokenExpiryMs());
    }

    private String buildToken(String subject, long expiryMs) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract the email address stored as the JWT subject.
     * Called by JwtAuthenticationFilter on every incoming request.
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validate the token:
     *   - signature matches our secret key
     *   - token has not expired
     *   - token is well-formed
     *
     * Returns true if valid, false + logs the reason if not.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("JWT signature invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Parse and return all claims from the token.
     * Throws an exception (caught in validateToken) if anything is wrong.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}