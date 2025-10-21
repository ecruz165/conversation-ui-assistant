package com.example.demo.management_service.mapper;

import com.example.demo.management_service.dto.response.ContactInfoResponse;
import com.example.demo.management_service.dto.response.DomainConfigurationResponse;
import com.example.demo.management_service.dto.response.ScannableDomainResponse;
import com.example.demo.management_service.dto.response.WebsiteResponse;
import com.example.demo.management_service.model.Website;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper component for converting between Website entity and response DTOs.
 * Handles JSON parsing and excludes sensitive credential information.
 */
@Component
public class WebsiteMapper {

    private final ObjectMapper objectMapper;

    public WebsiteMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Maps Website entity to WebsiteResponse DTO.
     * Excludes sensitive credential information from scannable domains.
     *
     * @param website the website entity
     * @return the website response DTO
     */
    public WebsiteResponse toResponse(Website website) {
        if (website == null) {
            return null;
        }

        ContactInfoResponse contactInfo = new ContactInfoResponse(
                website.getContactName(),
                website.getContactEmail(),
                website.getContactPhone(),
                website.getContactDepartment()
        );

        DomainConfigurationResponse domainConfiguration = new DomainConfigurationResponse(
                website.getPrimaryDomain(),
                parseScannableDomains(website.getScannableDomainsJson())
        );

        return new WebsiteResponse(
                website.getId(),
                website.getAppKey(),
                website.getName(),
                website.getDescription(),
                website.getWebsiteType(),
                website.getContainsPII(),
                contactInfo,
                domainConfiguration,
                website.getIsActive(),
                website.getCrawlEnabled(),
                website.getCreatedAt(),
                website.getUpdatedAt()
        );
    }

    /**
     * Parses scannable domains JSON and excludes sensitive credentials.
     *
     * @param scannableDomainsJson JSON string of scannable domains
     * @return list of scannable domain responses without credentials
     */
    private List<ScannableDomainResponse> parseScannableDomains(String scannableDomainsJson) {
        if (scannableDomainsJson == null || scannableDomainsJson.isEmpty() ||
                "[]".equals(scannableDomainsJson)) {
            return Collections.emptyList();
        }

        try {
            List<Map<String, Object>> domains = objectMapper.readValue(
                    scannableDomainsJson,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            return domains.stream()
                    .map(this::toDomainResponse)
                    .collect(Collectors.toList());

        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    /**
     * Converts domain map to ScannableDomainResponse, excluding credentials.
     *
     * @param domainMap map containing domain data
     * @return scannable domain response without credentials
     */
    private ScannableDomainResponse toDomainResponse(Map<String, Object> domainMap) {
        String url = (String) domainMap.get("url");
        Boolean requiresAuth = (Boolean) domainMap.get("requiresAuth");

        return new ScannableDomainResponse(url, requiresAuth);
    }
}
