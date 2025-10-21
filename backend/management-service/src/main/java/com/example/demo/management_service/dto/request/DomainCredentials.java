package com.example.demo.management_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Credentials for accessing protected domains during crawling.
 * Contains authentication information that should be encrypted before storage.
 */
public record DomainCredentials(
        @Size(max = 255, message = "Username must not exceed 255 characters")
        String username,

        @Size(max = 255, message = "Password must not exceed 255 characters")
        String password,

        @Size(max = 1000, message = "Auth token must not exceed 1000 characters")
        String authToken,

        @NotBlank(message = "Credential type is required")
        @Size(max = 50, message = "Credential type must not exceed 50 characters")
        String type
) {
}
