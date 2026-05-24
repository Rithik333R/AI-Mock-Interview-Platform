package com.mockiq.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenApiConfig — global Swagger / OpenAPI 3 configuration.
 *
 * What this does:
 *   1. Sets the API title, version, description shown at the top of Swagger UI
 *   2. Defines "bearerAuth" as the security scheme — this adds the
 *      green "Authorize 🔒" button to Swagger UI
 *   3. Makes "bearerAuth" a global security requirement — all endpoints
 *      show the lock icon and use the token once you click Authorize
 *   4. Sets the server URL so Swagger UI knows where to send requests
 *
 * How to use in Swagger UI:
 *   1. Open http://localhost:8080/swagger-ui.html
 *   2. Call POST /api/auth/login → copy the accessToken from the response
 *   3. Click "Authorize 🔒" at the top right
 *   4. Paste: Bearer <your_token>
 *   5. Click Authorize → Close
 *   6. Now every "Try it out" call sends the JWT automatically
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title       = "MockIQ API",
                version     = "1.0.0",
                description = """
                        **MockIQ** — AI-powered Mock Interview and Resume Intelligence Platform.
                        
                        ## Authentication
                        1. Use `POST /api/auth/register` or `POST /api/auth/login` to get a token
                        2. Click **Authorize 🔒** (top right) and enter: `Bearer <your_token>`
                        3. All protected endpoints will use the token automatically
                        
                        ## Features
                        - **Auth** — register, login with JWT
                        - **Resume** — upload PDF/DOCX, extract text, ATS scoring
                        - **Interviews** — AI-generated questions, per-answer feedback, session reports
                        - **Skill Gap** — AI analysis of resume vs target role
                        - **Roadmap** — personalised week-by-week learning plan
                        - **Dashboard** — analytics, score trends, skill summaries
                        """,
                contact = @Contact(
                        name  = "MockIQ Team",
                        email = "support@mockiq.com"
                ),
                license = @License(
                        name = "MIT License",
                        url  = "https://opensource.org/licenses/MIT"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Development")
        },
        // Apply bearerAuth globally — every endpoint shows the lock icon
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name         = "bearerAuth",                // must match @SecurityRequirement above
        type         = SecuritySchemeType.HTTP,
        scheme       = "bearer",
        bearerFormat = "JWT",
        in           = SecuritySchemeIn.HEADER,
        description  = "Paste your JWT token here. Format: Bearer <token>"
)
public class OpenApiConfig {
    // All configuration is via annotations — no bean methods needed
}