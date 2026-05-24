package com.mockiq.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AppProperties — binds all "app.*" values from application.yml
 * into a single typed, injectable config object.
 *
 * Usage anywhere in the app:
 *   @Autowired private AppProperties appProperties;
 *   appProperties.getJwt().getSecret();
 *
 * Why not just use @Value?
 *   @Value spreads magic strings across many files.
 *   This class gives us one place, type safety, and IDE autocomplete.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cloudinary cloudinary = new Cloudinary();
    private final Gemini gemini = new Gemini();

    @Getter
    @Setter
    public static class Jwt {

        /**
         * Secret key used to sign JWT tokens.
         * Must be at least 32 characters for HS256.
         */
        private String secret;
        private long accessTokenExpiryMs;
        private long refreshTokenExpiryMs;
    }

    @Getter
    @Setter
    public static class Cloudinary {
        private String cloudName;
        private String apiKey;
        private String apiSecret;
        private String folder;
    }

    @Getter
    @Setter
    public static class Gemini {
        private String apiKey;
        private String baseUrl;
        private int maxOutputTokens;
        private double temperature;
    }
}