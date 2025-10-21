package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Domain configuration for website registration.
 * Defines the primary domain and additional scannable domains.
 */
public record DomainConfiguration(
        @NotBlank(message = "Primary domain is required")
        @Pattern(
                regexp = "^https?://.*",
                message = "Primary domain must start with http:// or https://"
        )
        @Size(max = 500, message = "Primary domain must not exceed 500 characters")
        String primaryDomain,

        @Valid
        List<ScannableDomain> scannableDomains
) {
}
