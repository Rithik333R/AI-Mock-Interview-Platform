package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * BaseEntity — parent class for every JPA entity in this project.
 *
 * Provides:
 *   - id           : auto-incremented primary key
 *   - createdAt    : set automatically when the row is first saved
 *   - updatedAt    : updated automatically every time the row changes
 *
 * @MappedSuperclass  → JPA shares these columns with child entities
 *                      but does NOT create a "base_entity" table
 * @EntityListeners   → hooks into JPA lifecycle to auto-fill
 *                      createdAt and updatedAt (needs @EnableJpaAuditing)
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}