package com.example.demo.management_service.dto.response;

import java.time.OffsetDateTime;

/**
 * Response DTO for website registration.
 * Contains all public website information excluding sensitive credentials.
 */
public record WebsiteResponse(
        Long id,
        String appKey,
        String name,
        String description,
        String websiteType,
        Boolean containsPii,
        ContactInfoResponse contactInfo,
        DomainConfigurationResponse domainConfiguration,
        Boolean isActive,
        Boolean crawlEnabled,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
