package com.mockiq.backend.config;

/**
 * SwaggerConstants — tag names and descriptions used across controllers.
 *
 * Tags group endpoints into sections in Swagger UI.
 * Using constants prevents typos causing endpoints to appear
 * in the wrong group or create duplicate groups.
 */
public final class SwaggerConstants {

    private SwaggerConstants() {}

    public static final String TAG_AUTH      = "Authentication";
    public static final String TAG_USER      = "User Profile";
    public static final String TAG_RESUME    = "Resume Management";
    public static final String TAG_INTERVIEW = "Mock Interviews";
    public static final String TAG_SKILLGAP  = "Skill Gap Analysis";
    public static final String TAG_ROADMAP   = "Learning Roadmap";
    public static final String TAG_DASHBOARD = "Dashboard Analytics";

    public static final String DESC_AUTH =
            "Register a new account and login to receive a JWT access token.";

    public static final String DESC_USER =
            "View and update the currently authenticated user's profile.";

    public static final String DESC_RESUME =
            "Upload PDF or DOCX resumes, extract text, and score against job descriptions.";

    public static final String DESC_INTERVIEW =
            "Start AI-powered mock interview sessions, submit answers, and view detailed reports.";

    public static final String DESC_SKILLGAP =
            "Analyse your resume against a target role to identify skill gaps and readiness.";

    public static final String DESC_ROADMAP =
            "Generate a personalised week-by-week learning plan and track milestone completion.";

    public static final String DESC_DASHBOARD =
            "Aggregated analytics: interview stats, score trends, and skill summaries.";
}