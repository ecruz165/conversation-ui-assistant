package com.example.demo.management_service.dto.response;

import java.util.List;

/**
 * Response DTO for domain configuration.
 */
public record DomainConfigurationResponse(
        String primaryDomain,
        List<ScannableDomainResponse> scannableDomains
) {
}
