package com.mockiq.backend.config;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * CloudinaryConfig — creates the Cloudinary SDK bean.
 *
 * Why a @Configuration class?
 *   Cloudinary's SDK requires an initialisation step with
 *   credentials. Doing this once at startup and exposing it
 *   as a @Bean means every service shares one configured
 *   instance (no repeated init, no hardcoded credentials).
 *
 * How to get free Cloudinary credentials:
 *   1. Sign up at https://cloudinary.com (free tier)
 *   2. Go to Dashboard → copy Cloud Name, API Key, API Secret
 *   3. Paste into application.yml under app.cloudinary.*
 */
@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final AppProperties appProperties;

    @Bean
    public Cloudinary cloudinary() {
        AppProperties.Cloudinary config = appProperties.getCloudinary();

        return new Cloudinary(Map.of(
                "cloud_name", config.getCloudName(),
                "api_key",    config.getApiKey(),
                "api_secret", config.getApiSecret(),
                "secure",     true                    // always use HTTPS URLs
        ));
    }
}