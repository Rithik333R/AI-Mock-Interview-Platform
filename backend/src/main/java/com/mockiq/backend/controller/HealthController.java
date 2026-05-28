package com.mockiq.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * HealthController — app + database health check.
 *
 * Why query the DB here?
 *   UptimeRobot pings /api/health every 5 minutes.
 *   This keeps BOTH Render (backend) and Aiven (database) alive.
 *   A single ping prevents two services from sleeping.
 *
 *   Without the DB query, Aiven still powers off even if
 *   Render is awake — because Aiven tracks database activity,
 *   not HTTP activity.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {

        // Ping the database with the lightest possible query
        // This counts as activity for Aiven — keeps it awake
        String dbStatus;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbStatus = "UP";
        } catch (Exception e) {
            dbStatus = "DOWN";
        }

        return ResponseEntity.ok(Map.of(
                "status",    "UP",
                "database",  dbStatus,
                "app",       "MockIQ Backend",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}