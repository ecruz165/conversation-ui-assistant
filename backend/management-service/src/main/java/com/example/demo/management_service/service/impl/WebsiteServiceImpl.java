package com.example.demo.management_service.service.impl;

import com.example.demo.management_service.dao.WebsiteDao;
import com.example.demo.management_service.dto.request.ContactInfo;
import com.example.demo.management_service.dto.request.DomainConfiguration;
import com.example.demo.management_service.dto.request.ScannableDomain;
import com.example.demo.management_service.exception.ValidationException;
import com.example.demo.management_service.model.Website;
import com.example.demo.management_service.service.WebsiteService;
import com.example.demo.management_service.util.EncryptionUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of WebsiteService with business logic and validation.
 * Handles website registration with PII compliance checks and credential encryption.
 */
@Service
@Transactional
public class WebsiteServiceImpl implements WebsiteService {

    private final WebsiteDao websiteDao;
    private final EncryptionUtil encryptionUtil;
    private final ObjectMapper objectMapper;

    public WebsiteServiceImpl(
            WebsiteDao websiteDao,
            EncryptionUtil encryptionUtil,
            ObjectMapper objectMapper
    ) {
        this.websiteDao = websiteDao;
        this.encryptionUtil = encryptionUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public Website registerWebsite(
            String name,
            String description,
            String websiteType,
            Boolean containsPii,
            ContactInfo contactInfo,
            DomainConfiguration domainConfiguration,
            Boolean crawlEnabled
    ) {
        // Validate business rules
        validateBusinessRules(containsPii, domainConfiguration);

        // Check domain uniqueness
        if (websiteDao.existsByPrimaryDomain(domainConfiguration.primaryDomain())) {
            throw new ValidationException(
                    "A website with primary domain '" + domainConfiguration.primaryDomain() +
                            "' already exists"
            );
        }

        // Encrypt credentials in scannable domains
        String scannableDomainsJson = encryptCredentials(domainConfiguration.scannableDomains());

        // Create Website entity
        Website website = new Website();
        website.setAppKey(generateAppKey());
        website.setName(name);
        website.setDescription(description);
        website.setWebsiteType(websiteType);
        website.setContainsPII(containsPii != null ? containsPii : false);

        // Set contact information
        if (contactInfo != null) {
            website.setContactName(contactInfo.name());
            website.setContactEmail(contactInfo.email());
            website.setContactPhone(contactInfo.phone());
            website.setContactDepartment(contactInfo.department());
        }

        // Set domain configuration
        website.setPrimaryDomain(domainConfiguration.primaryDomain());
        website.setScannableDomainsJson(scannableDomainsJson);

        // Set flags
        website.setIsActive(true);
        website.setCrawlEnabled(crawlEnabled != null ? crawlEnabled : false);

        // Insert into database
        return websiteDao.insert(website);
    }

    /**
     * Validates business rules for website registration.
     *
     * @param containsPii          whether the website contains PII
     * @param domainConfiguration  domain configuration with scannable domains
     * @throws ValidationException if validation fails
     */
    private void validateBusinessRules(
            Boolean containsPii,
            DomainConfiguration domainConfiguration
    ) {
        // If website contains PII, scannable domains are required
        if (Boolean.TRUE.equals(containsPii)) {
            if (domainConfiguration.scannableDomains() == null ||
                    domainConfiguration.scannableDomains().isEmpty()) {
                throw new ValidationException(
                        "Websites containing PII must have at least one scannable domain configured"
                );
            }

            // All scannable domains must have credentials when PII is involved
            for (ScannableDomain domain : domainConfiguration.scannableDomains()) {
                if (Boolean.TRUE.equals(domain.requiresAuth()) &&
                        (domain.credentials() == null ||
                                (domain.credentials().username() == null &&
                                        domain.credentials().password() == null &&
                                        domain.credentials().authToken() == null))) {
                    throw new ValidationException(
                            "Scannable domain '" + domain.url() +
                                    "' requires authentication but no credentials provided"
                    );
                }
            }

            // Only one scannable domain can be active at a time
            long activeCount = domainConfiguration.scannableDomains().stream()
                    .filter(domain -> !Boolean.FALSE.equals(domain.requiresAuth()))
                    .count();

            if (activeCount > 1) {
                throw new ValidationException(
                        "Only one scannable domain can be active (requiresAuth=true) at a time"
                );
            }
        }
    }

    /**
     * Encrypts credentials in scannable domains and returns JSON string.
     *
     * @param scannableDomains list of scannable domains with potentially sensitive credentials
     * @return JSON string with encrypted credentials
     */
    private String encryptCredentials(List<ScannableDomain> scannableDomains) {
        if (scannableDomains == null || scannableDomains.isEmpty()) {
            return "[]";
        }

        try {
            // Convert to JSON, encrypt passwords, convert back
            String json = objectMapper.writeValueAsString(scannableDomains);

            // Parse JSON to modify credentials
            List<Map<String, Object>> domains = objectMapper.readValue(
                    json,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            // Encrypt credentials in each domain
            for (Map<String, Object> domain : domains) {
                @SuppressWarnings("unchecked")
                Map<String, Object> credentials = (Map<String, Object>) domain.get("credentials");
                if (credentials != null) {
                    // Encrypt password if present
                    if (credentials.containsKey("password") &&
                            credentials.get("password") != null) {
                        String password = (String) credentials.get("password");
                        credentials.put("password", encryptionUtil.encrypt(password));
                    }

                    // Encrypt authToken if present
                    if (credentials.containsKey("authToken") &&
                            credentials.get("authToken") != null) {
                        String authToken = (String) credentials.get("authToken");
                        credentials.put("authToken", encryptionUtil.encrypt(authToken));
                    }
                }
            }

            return objectMapper.writeValueAsString(domains);

        } catch (JsonProcessingException e) {
            throw new ValidationException("Failed to process scannable domains JSON", e);
        }
    }

    /**
     * Generates a unique app key for the website.
     *
     * @return unique app key
     */
    private String generateAppKey() {
        return UUID.randomUUID().toString();
    }
}
