package com.example.demo.management_service.dto.error;

import java.time.OffsetDateTime;

/**
 * Standard error response DTO for API errors.
 */
public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
