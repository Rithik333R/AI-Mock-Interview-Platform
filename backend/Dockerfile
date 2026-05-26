# ══════════════════════════════════════════════════════════════
#   MockIQ Backend — Dockerfile
#   Multi-stage build:
#     Stage 1 (builder) → compile the JAR with Maven
#     Stage 2 (runtime) → run the JAR with minimal JRE image
#
#   Result: ~220MB image instead of ~600MB with full JDK
#   Place this file at: backend/Dockerfile
# ══════════════════════════════════════════════════════════════

# ── Stage 1: Build ────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper first (cached layer — only re-downloads
# dependencies when pom.xml changes, not on every code change)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the JAR, skip tests (tests run in CI separately)
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S mockiq && adduser -S mockiq -G mockiq

# Copy only the built JAR from the builder stage
COPY --from=builder /app/target/mockiq-backend.jar app.jar

# Give ownership to non-root user
RUN chown mockiq:mockiq app.jar

USER mockiq

# Expose the port Spring Boot runs on
EXPOSE 8080

# JVM flags for container-aware memory management
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:InitialRAMPercentage=50.0 \
               -Djava.security.egd=file:/dev/./urandom"

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]