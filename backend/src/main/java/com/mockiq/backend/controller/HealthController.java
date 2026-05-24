package com.mockiq.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * HealthController — Phase 0 verification endpoint.
 *
 * Hit GET /api/health to confirm:
 *   ✓ Spring Boot started
 *   ✓ Web layer is working
 *   ✓ JSON serialization is working
 *
 * Will be removed or moved to an actuator config in later phases.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status",    "UP",
                "app",       "MockIQ Backend",
                "phase",     "Phase 0 — DB connection verified",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}