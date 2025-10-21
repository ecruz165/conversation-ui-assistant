package com.example.demo.management_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Contact information for website registration.
 * Contains contact person details and department information.
 */
public record ContactInfo(
        @Size(max = 255, message = "Contact name must not exceed 255 characters")
        String name,

        @Email(message = "Contact email must be valid")
        @Size(max = 255, message = "Contact email must not exceed 255 characters")
        String email,

        @Pattern(
                regexp = "^\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}$",
                message = "Phone must match pattern (XXX) XXX-XXXX or XXX-XXX-XXXX"
        )
        @Size(max = 50, message = "Contact phone must not exceed 50 characters")
        String phone,

        @Size(max = 255, message = "Department name must not exceed 255 characters")
        String department
) {
}
