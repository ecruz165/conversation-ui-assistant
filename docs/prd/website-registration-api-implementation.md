# Product Requirements Document: Website Registration API Implementation

## 1. Overview

### 1.1 Purpose
This PRD defines the backend API implementation for the "Register New Website" functionality in the Management UI. The implementation will follow a clean architecture pattern with REST controllers, service layer, and JDBI-based DAO layer.

### 1.2 Scope
- REST API endpoint for website registration
- Service layer for business logic
- JDBI DAO layer for database operations
- Request/Response DTOs as Java records
- Integration with existing `websites` table schema

### 1.3 Architecture Principles
- **Controllers**: No business logic, only request/response handling and validation
- **Services**: All business logic, orchestration, and validation
- **DAOs**: Database operations only using JDBI
- **DTOs**: All request/response objects must be Java records
- **Service Methods**: Should NOT receive request/response wrapper DTOs

---

## 2. Database Schema Reference

### 2.1 Existing `websites` Table
```sql
CREATE TABLE websites (
    id BIGSERIAL PRIMARY KEY,
    app_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(500) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    crawl_enabled BOOLEAN NOT NULL DEFAULT false,
    crawl_config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Required Schema Extension
A new migration file is needed to support the enhanced registration form:

**File**: `V1.6.1__Extend_websites_table_for_registration.sql`

```sql
-- Add new columns to websites table for enhanced registration
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS website_type VARCHAR(50) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS contains_pii BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS scannable_domains JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS primary_domain VARCHAR(500);

-- Add constraints
ALTER TABLE websites
ADD CONSTRAINT websites_type_check CHECK (website_type IN ('website', 'internal_app', 'mobile_app'));

-- Update existing domain column to be nullable (primary_domain will be the new primary)
ALTER TABLE websites ALTER COLUMN domain DROP NOT NULL;

-- Add comments
COMMENT ON COLUMN websites.website_type IS 'Type of website: website, internal_app, or mobile_app';
COMMENT ON COLUMN websites.contains_pii IS 'Whether the application contains Personal Identifiable Information';
COMMENT ON COLUMN websites.contact_name IS 'Primary contact person name';
COMMENT ON COLUMN websites.contact_phone IS 'Primary contact phone number';
COMMENT ON COLUMN websites.contact_department IS 'Department of the primary contact';
COMMENT ON COLUMN websites.scannable_domains IS 'Array of non-production domains with credentials for scanning';
COMMENT ON COLUMN websites.primary_domain IS 'Primary production domain URL';
```

---

## 3. API Specification

### 3.1 Endpoint
```
POST /api/websites/register
```

### 3.2 Request Body Structure

Based on the frontend form (`WebsiteRegistrationForm.tsx`), the request structure is:

```json
{
  "name": "string (required, 1-255 chars)",
  "type": "website | internal_app | mobile_app (required)",
  "description": "string (required)",
  "containsPII": "boolean (required)",
  "contact": {
    "name": "string (required)",
    "email": "string (required, valid email)",
    "department": "string (required)",
    "phone": "string (required, 10 digits formatted)"
  },
  "domains": {
    "primary": "string (required, valid URL with protocol)",
    "scannableDomains": [
      {
        "domain": "string (required if containsPII=true)",
        "isActive": "boolean (required)",
        "credentials": {
          "username": "string (required if containsPII=true)",
          "password": "string (required if containsPII=true)"
        }
      }
    ]
  }
}
```

### 3.3 Response Structure

**Success Response (201 Created)**
```json
{
  "id": "string",
  "appKey": "string (auto-generated)",
  "name": "string",
  "type": "string",
  "description": "string",
  "containsPII": "boolean",
  "contact": {
    "name": "string",
    "email": "string",
    "department": "string",
    "phone": "string"
  },
  "domains": {
    "primary": "string",
    "scannableDomains": [
      {
        "domain": "string",
        "isActive": "boolean"
      }
    ]
  },
  "isActive": "boolean",
  "crawlEnabled": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Response (400 Bad Request)**
```json
{
  "timestamp": "string (ISO 8601)",
  "status": 400,
  "error": "Bad Request",
  "message": "string (validation error details)",
  "path": "/api/websites/register"
}
```

---

## 4. Implementation Details

### 4.1 Package Structure
```
com.example.demo.management_service/
├── controller/
│   └── WebsiteController.java
├── service/
│   ├── WebsiteService.java
│   └── impl/
│       └── WebsiteServiceImpl.java
├── dao/
│   ├── WebsiteDao.java
│   └── impl/
│       └── WebsiteDaoImpl.java
├── dto/
│   ├── request/
│   │   ├── RegisterWebsiteRequest.java
│   │   ├── ContactInfo.java
│   │   ├── DomainConfiguration.java
│   │   ├── ScannableDomain.java
│   │   └── DomainCredentials.java
│   └── response/
│       ├── WebsiteResponse.java
│       ├── ContactInfoResponse.java
│       └── DomainConfigurationResponse.java
├── model/
│   └── Website.java
└── exception/
    ├── WebsiteAlreadyExistsException.java
    └── InvalidWebsiteDataException.java
```

### 4.2 DTO Definitions (Java Records)

#### 4.2.1 Request DTOs

**RegisterWebsiteRequest.java**
```java
package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterWebsiteRequest(
    @NotBlank(message = "Website name is required")
    @Size(min = 1, max = 255, message = "Website name must be between 1 and 255 characters")
    String name,
    
    @NotNull(message = "Website type is required")
    @Pattern(regexp = "website|internal_app|mobile_app", message = "Invalid website type")
    String type,
    
    @NotBlank(message = "Description is required")
    String description,
    
    @NotNull(message = "PII flag is required")
    Boolean containsPII,
    
    @NotNull(message = "Contact information is required")
    @Valid
    ContactInfo contact,
    
    @NotNull(message = "Domain configuration is required")
    @Valid
    DomainConfiguration domains
) {}
```

**ContactInfo.java**
```java
package com.example.demo.management_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ContactInfo(
    @NotBlank(message = "Contact name is required")
    String name,
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,
    
    @NotBlank(message = "Department is required")
    String department,
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(\\d{3}\\) \\d{3}-\\d{4}$", message = "Phone must be in format (XXX) XXX-XXXX")
    String phone
) {}
```

**DomainConfiguration.java**
```java
package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record DomainConfiguration(
    @NotBlank(message = "Primary domain is required")
    @Pattern(regexp = "^https?://.*", message = "Primary domain must include protocol (http:// or https://)")
    String primary,
    
    @Valid
    List<ScannableDomain> scannableDomains
) {}
```

**ScannableDomain.java**
```java
package com.example.demo.management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ScannableDomain(
    @NotBlank(message = "Domain URL is required")
    @Pattern(regexp = "^https?://.*", message = "Domain must include protocol (http:// or https://)")
    String domain,
    
    @NotNull(message = "Active status is required")
    Boolean isActive,
    
    @Valid
    DomainCredentials credentials
) {}
```

**DomainCredentials.java**
```java
package com.example.demo.management_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DomainCredentials(
    @NotBlank(message = "Username is required for scannable domains")
    String username,
    
    @NotBlank(message = "Password is required for scannable domains")
    String password
) {}
```

#### 4.2.2 Response DTOs

**WebsiteResponse.java**
```java
package com.example.demo.management_service.dto.response;

import java.time.OffsetDateTime;

public record WebsiteResponse(
    Long id,
    String appKey,
    String name,
    String type,
    String description,
    Boolean containsPII,
    ContactInfoResponse contact,
    DomainConfigurationResponse domains,
    Boolean isActive,
    Boolean crawlEnabled,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
```

**ContactInfoResponse.java**
```java
package com.example.demo.management_service.dto.response;

public record ContactInfoResponse(
    String name,
    String email,
    String department,
    String phone
) {}
```

**DomainConfigurationResponse.java**
```java
package com.example.demo.management_service.dto.response;

import java.util.List;

public record DomainConfigurationResponse(
    String primary,
    List<ScannableDomainResponse> scannableDomains
) {}
```

**ScannableDomainResponse.java**
```java
package com.example.demo.management_service.dto.response;

public record ScannableDomainResponse(
    String domain,
    Boolean isActive
) {
    // Note: credentials are NOT included in response for security
}
```

### 4.3 Service Layer

**WebsiteService.java** (Interface)
```java
package com.example.demo.management_service.service;

import com.example.demo.management_service.model.Website;

public interface WebsiteService {
    /**
     * Register a new website
     * @param name Website name
     * @param type Website type (website, internal_app, mobile_app)
     * @param description Website description
     * @param containsPII Whether website contains PII
     * @param contactName Contact person name
     * @param contactEmail Contact email
     * @param contactDepartment Contact department
     * @param contactPhone Contact phone
     * @param primaryDomain Primary production domain
     * @param scannableDomainsJson JSON array of scannable domains with credentials
     * @return Created Website entity
     */
    Website registerWebsite(
        String name,
        String type,
        String description,
        Boolean containsPII,
        String contactName,
        String contactEmail,
        String contactDepartment,
        String contactPhone,
        String primaryDomain,
        String scannableDomainsJson
    );
}
```

---

## 5. Validation Rules

### 5.1 Business Validation Rules
1. **PII Validation**: If `containsPII = true`, at least one scannable domain with credentials must be provided
2. **Domain Uniqueness**: Primary domain must be unique across all registered websites
3. **Active Domain**: Only one scannable domain can be marked as `isActive = true`
4. **Email Format**: Must be valid email format
5. **Phone Format**: Must be exactly 10 digits, formatted as `(XXX) XXX-XXXX`
6. **URL Format**: All domains must include protocol (`http://` or `https://`)

### 5.2 Database Constraints
- `name`: NOT NULL, 1-255 characters
- `type`: Must be one of: `website`, `internal_app`, `mobile_app`
- `contact_email`: Valid email format
- `primary_domain`: Valid URL format with protocol
- `app_key`: Auto-generated, unique

---

## 6. Error Handling

### 6.1 Exception Types
- `WebsiteAlreadyExistsException`: When primary domain already exists
- `InvalidWebsiteDataException`: When validation fails
- `DataAccessException`: When database operation fails

### 6.2 HTTP Status Codes
- `201 Created`: Successful registration
- `400 Bad Request`: Validation errors
- `409 Conflict`: Website with same domain already exists
- `500 Internal Server Error`: Unexpected server errors

---

## 7. Security Considerations

### 7.1 Credential Storage
- Scannable domain credentials must be encrypted before storage
- Use AES-256 encryption for password fields
- Store encryption key in secure configuration (environment variable)

### 7.2 Response Security
- Never return credentials in API responses
- Sanitize error messages to avoid information leakage

---

## 8. Testing Requirements

### 8.1 Unit Tests
- Service layer validation logic
- DTO validation constraints
- Business rule enforcement

### 8.2 Integration Tests
- End-to-end API endpoint testing
- Database transaction handling
- Error scenario testing

---

## 9. Implementation Checklist

- [ ] Create database migration `V1.6.1__Extend_websites_table_for_registration.sql`
- [ ] Create all DTO record classes (request and response)
- [ ] Create `Website` entity model
- [ ] Create `WebsiteDao` interface and JDBI implementation
- [ ] Create `WebsiteService` interface and implementation
- [ ] Create `WebsiteController` with POST endpoint
- [ ] Implement credential encryption utility
- [ ] Add validation annotations and custom validators
- [ ] Create custom exception classes
- [ ] Implement global exception handler
- [ ] Write unit tests for service layer
- [ ] Write integration tests for API endpoint
- [ ] Update API documentation (Swagger/OpenAPI)
- [ ] Test with frontend integration

---

## 10. Dependencies

### 10.1 Required Libraries
- Spring Boot Web
- Spring Boot Validation
- JDBI 3
- PostgreSQL Driver
- Jackson (for JSON handling)
- Spring Security (for encryption utilities)

### 10.2 Configuration
Add to `application.properties`:
```properties
# Website Registration
app.website.encryption.key=${WEBSITE_ENCRYPTION_KEY:default-key-for-dev-only}
app.website.encryption.algorithm=AES/GCM/NoPadding
```

---

## 11. Future Enhancements

1. **Async Registration**: Move to async processing for large-scale registrations
2. **Email Verification**: Send verification email to contact email
3. **Domain Verification**: Verify domain ownership before activation
4. **Audit Logging**: Track all registration attempts and changes
5. **Bulk Registration**: Support CSV/Excel upload for multiple websites
6. **Webhook Integration**: Notify external systems on registration

---

## Appendix A: Frontend Integration

The frontend form is located at:
- **Component**: `frontend/management-ui/src/components/WebsiteRegistrationForm.tsx`
- **Page**: `frontend/management-ui/src/pages/RegisterWebsite.tsx`
- **Type Definitions**: `frontend/management-ui/src/types/index.ts`

The form submits data in the format specified in Section 3.2.

