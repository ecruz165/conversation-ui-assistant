# Multi-stage build for Management Service
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

# Set working directory
WORKDIR /app

# Copy parent POM first for better layer caching
COPY ../../pom.xml ./parent-pom.xml

# Copy service POM and source
COPY pom.xml ./
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -f pom.xml

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to app user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
