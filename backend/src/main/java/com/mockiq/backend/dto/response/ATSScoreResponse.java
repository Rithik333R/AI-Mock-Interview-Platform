package com.mockiq.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ATSScoreResponse — structured ATS analysis result.
 *
 * Fields:
 *   score          → 0-100 compatibility score
 *   summary        → one paragraph overall assessment
 *   matchedSkills  → skills found in both resume and JD
 *   missingSkills  → skills in JD but not in resume
 *   suggestions    → specific actionable improvements
 *   experience     → feedback on experience match
 *   education      → feedback on education match
 *
 * @NoArgsConstructor — needed for Jackson to deserialise
 *   the AI's JSON response into this object.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ATSScoreResponse {

    private int          score;
    private String       summary;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> suggestions;
    private String       experienceFeedback;
    private String       educationFeedback;
}