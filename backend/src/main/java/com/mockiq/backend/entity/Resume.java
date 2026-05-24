package com.mockiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Resume — represents an uploaded resume file.
 *
 * One user can upload multiple resumes (e.g. one per job target).
 * Each resume stores:
 *   - where the file lives (Cloudinary URL)
 *   - the original filename (shown in UI)
 *   - the raw extracted text (used by AI in Phase 4+)
 *   - the file type (PDF or DOCX)
 *   - soft delete flag (we never hard-delete user data)
 *
 * Relationship:
 *   Many resumes → One user
 *   @ManyToOne with LAZY loading — we only fetch the User
 *   when explicitly accessed, not on every resume query.
 */
@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume extends BaseEntity {

    /**
     * The user who owns this resume.
     * FetchType.LAZY = don't JOIN users table unless we need it.
     * This avoids loading the full user object on every resume fetch.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Original filename as uploaded by the user.
     * e.g. "john_doe_resume_2025.pdf"
     * Shown in the UI so the user recognises their file.
     */
    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    /**
     * Cloudinary public ID — used to build the URL
     * and to delete the file from Cloudinary later.
     * e.g. "mockiq/resumes/abc123"
     */
    @Column(name = "cloudinary_public_id", nullable = false, length = 500)
    private String cloudinaryPublicId;

    /**
     * Full Cloudinary URL to the file.
     * e.g. "https://res.cloudinary.com/yourcloud/raw/upload/..."
     * Stored so we can serve a download link to the user.
     */
    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    /**
     * File type: "PDF" or "DOCX"
     * Used to know which parser to call and shown in the UI.
     */
    @Column(name = "file_type", nullable = false, length = 10)
    private String fileType;

    /**
     * Raw text extracted from the resume file.
     * Used in Phase 4+ by AI for ATS scoring and skill gap analysis.
     * LONGTEXT in MySQL — resumes can be many pages.
     */
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;

    /**
     * The job description this resume was scored against.
     * Stored so the user can see what role the score applies to.
     */
    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    /**
     * ATS compatibility score: 0–100.
     * Null until the user requests a score for the first time.
     */
    @Column(name = "ats_score")
    private Integer atsScore;

    /**
     * Full AI feedback stored as a JSON string.
     * Contains matched skills, missing skills, suggestions.
     * Stored raw so we can re-parse it without re-calling the AI.
     */
    @Column(name = "ats_feedback", columnDefinition = "LONGTEXT")
    private String atsFeedback;

    /**
     * Soft delete — marks resume as removed without
     * actually deleting the DB row or the Cloudinary file.
     * Preserves history for analytics and audit.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}