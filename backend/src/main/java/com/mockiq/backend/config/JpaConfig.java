package com.mockiq.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JpaConfig — enables JPA Auditing.
 *
 * Without this, @CreatedDate and @LastModifiedDate in BaseEntity
 * do nothing — the fields stay null.
 *
 * With this, Hibernate automatically fills createdAt on INSERT
 * and updatedAt on every UPDATE.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // No code needed — the annotation does all the work
}