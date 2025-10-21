package com.example.demo.management_service.model;

import java.time.OffsetDateTime;

/**
 * Entity model for Website.
 * Represents a registered website in the system with contact information,
 * domain configuration, and PII tracking.
 */
public class Website {
    private Long id;
    private String appKey;
    private String name;
    private String websiteType;
    private String description;
    private Boolean containsPII;
    private String contactName;
    private String contactEmail;
    private String contactDepartment;
    private String contactPhone;
    private String primaryDomain;
    private String scannableDomainsJson; // JSONB stored as String
    private Boolean isActive;
    private Boolean crawlEnabled;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    /**
     * Default constructor with default values for flags.
     */
    public Website() {
        this.isActive = true;
        this.crawlEnabled = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAppKey() {
        return appKey;
    }

    public void setAppKey(String appKey) {
        this.appKey = appKey;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWebsiteType() {
        return websiteType;
    }

    public void setWebsiteType(String websiteType) {
        this.websiteType = websiteType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getContainsPII() {
        return containsPII;
    }

    public void setContainsPII(Boolean containsPII) {
        this.containsPII = containsPII;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactDepartment() {
        return contactDepartment;
    }

    public void setContactDepartment(String contactDepartment) {
        this.contactDepartment = contactDepartment;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getPrimaryDomain() {
        return primaryDomain;
    }

    public void setPrimaryDomain(String primaryDomain) {
        this.primaryDomain = primaryDomain;
    }

    public String getScannableDomainsJson() {
        return scannableDomainsJson;
    }

    public void setScannableDomainsJson(String scannableDomainsJson) {
        this.scannableDomainsJson = scannableDomainsJson;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getCrawlEnabled() {
        return crawlEnabled;
    }

    public void setCrawlEnabled(Boolean crawlEnabled) {
        this.crawlEnabled = crawlEnabled;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
