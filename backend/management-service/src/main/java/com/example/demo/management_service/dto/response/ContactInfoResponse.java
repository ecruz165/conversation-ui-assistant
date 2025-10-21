package com.example.demo.management_service.dto.response;

/**
 * Response DTO for contact information.
 */
public record ContactInfoResponse(
        String name,
        String email,
        String phone,
        String department
) {
}
