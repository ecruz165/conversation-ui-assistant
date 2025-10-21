package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for registering a new website.
 * Contains all information needed to register a website including contact details,
 * domain configuration, and PII tracking flags.
 */
public record RegisterWebsiteRequest(
        @NotBlank(message = "Website name is required")
        @Size(min = 1, max = 255, message = "Website name must be between 1 and 255 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @NotBlank(message = "Website type is required")
        @Pattern(
                regexp = "^(website|internal_app|mobile_app)$",
                message = "Website type must be one of: website, internal_app, mobile_app"
        )
        String websiteType,

        Boolean containsPii,

        @Valid
        ContactInfo contactInfo,

        @Valid
        DomainConfiguration domainConfiguration,

        Boolean crawlEnabled
) {
}
