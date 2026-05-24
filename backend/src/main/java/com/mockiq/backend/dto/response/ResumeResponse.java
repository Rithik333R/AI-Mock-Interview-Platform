package com.mockiq.backend.dto.response;

import com.mockiq.backend.entity.Resume;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * ResumeResponse — public representation of a Resume.
 *
 * What's included:
 *   id, originalFileName, fileUrl, fileType,
 *   hasExtractedText (boolean flag), isActive, createdAt
 *
 * What's excluded:
 *   cloudinaryPublicId — internal storage detail, not for clients
 *   extractedText      — can be MB of text; fetched separately if needed
 *   user               — redundant (caller already knows their own id)
 */
@Getter
@Builder
public class ResumeResponse {

    private Long          id;
    private String        originalFileName;
    private String        fileUrl;
    private String        fileType;
    private Boolean       hasExtractedText;    // true = parsing succeeded
    private Boolean       isActive;
    private LocalDateTime createdAt;

    public static ResumeResponse fromEntity(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .originalFileName(resume.getOriginalFileName())
                .fileUrl(resume.getFileUrl())
                .fileType(resume.getFileType())
                .hasExtractedText(resume.getExtractedText() != null
                        && !resume.getExtractedText().isBlank())
                .isActive(resume.getIsActive())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}