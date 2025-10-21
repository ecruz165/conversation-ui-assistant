package com.example.demo.management_service.service;

import com.example.demo.management_service.dto.request.ContactInfo;
import com.example.demo.management_service.dto.request.DomainConfiguration;
import com.example.demo.management_service.model.Website;

/**
 * Service interface for website management operations.
 * Handles business logic, validation, and orchestration for website registration.
 */
public interface WebsiteService {

    /**
     * Registers a new website with validation and encryption of credentials.
     *
     * @param name               the website name
     * @param description        optional description
     * @param websiteType        type of website (website, internal_app, mobile_app)
     * @param containsPii        whether the website contains PII
     * @param contactInfo        contact information for the website
     * @param domainConfiguration domain and scannable domain configuration
     * @param crawlEnabled       whether crawling is enabled for this website
     * @return the registered website with generated ID and timestamps
     */
    Website registerWebsite(
            String name,
            String description,
            String websiteType,
            Boolean containsPii,
            ContactInfo contactInfo,
            DomainConfiguration domainConfiguration,
            Boolean crawlEnabled
    );
}
