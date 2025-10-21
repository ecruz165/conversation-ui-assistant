package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Scannable domain configuration for website crawling.
 * Defines domains that can be crawled with optional credentials.
 */
public record ScannableDomain(
        @NotBlank(message = "Domain URL is required")
        @Pattern(
                regexp = "^https?://.*",
                message = "Domain must start with http:// or https://"
        )
        @Size(max = 500, message = "Domain URL must not exceed 500 characters")
        String url,

        Boolean requiresAuth,

        @Valid
        DomainCredentials credentials
) {
}
