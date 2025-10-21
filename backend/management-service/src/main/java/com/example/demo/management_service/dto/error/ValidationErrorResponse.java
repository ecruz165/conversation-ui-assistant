package com.example.demo.management_service.dto.error;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Validation error response DTO with field-level error details.
 */
public record ValidationErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> errors
) {
}
