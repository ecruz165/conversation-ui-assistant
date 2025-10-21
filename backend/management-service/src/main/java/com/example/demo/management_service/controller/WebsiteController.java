package com.example.demo.management_service.controller;

import com.example.demo.management_service.dto.request.RegisterWebsiteRequest;
import com.example.demo.management_service.dto.response.WebsiteResponse;
import com.example.demo.management_service.mapper.WebsiteMapper;
import com.example.demo.management_service.model.Website;
import com.example.demo.management_service.service.WebsiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for website management operations.
 * Handles website registration and related endpoints.
 */
@RestController
@RequestMapping("/api/websites")
public class WebsiteController {

    private final WebsiteService websiteService;
    private final WebsiteMapper websiteMapper;

    public WebsiteController(
            WebsiteService websiteService,
            WebsiteMapper websiteMapper
    ) {
        this.websiteService = websiteService;
        this.websiteMapper = websiteMapper;
    }

    /**
     * Registers a new website with the system.
     * Validates request data, processes registration, and returns created website details.
     *
     * @param request the registration request with all website details
     * @return ResponseEntity with created website response and 201 status
     */
    @PostMapping("/register")
    public ResponseEntity<WebsiteResponse> registerWebsite(
            @Valid @RequestBody RegisterWebsiteRequest request
    ) {
        // Extract individual parameters from nested request DTOs
        Website website = websiteService.registerWebsite(
                request.name(),
                request.description(),
                request.websiteType(),
                request.containsPii(),
                request.contactInfo(),
                request.domainConfiguration(),
                request.crawlEnabled()
        );

        // Map entity to response DTO
        WebsiteResponse response = websiteMapper.toResponse(website);

        // Return 201 Created with response body
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
