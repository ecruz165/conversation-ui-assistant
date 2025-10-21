package com.example.demo.management_service.dto.response;

/**
 * Response DTO for scannable domain configuration.
 * Excludes credentials for security purposes.
 */
public record ScannableDomainResponse(
        String url,
        Boolean requiresAuth
        // Credentials are intentionally excluded for security
) {
}
