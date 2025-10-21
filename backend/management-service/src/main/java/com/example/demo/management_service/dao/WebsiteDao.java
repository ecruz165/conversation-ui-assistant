package com.example.demo.management_service.dao;

import com.example.demo.management_service.model.Website;

import java.util.Optional;

/**
 * Data Access Object interface for Website entity.
 * Provides CRUD operations and query methods for website management.
 */
public interface WebsiteDao {

    /**
     * Insert a new website into the database.
     *
     * @param website the website to insert
     * @return the inserted website with generated ID and timestamps
     */
    Website insert(Website website);

    /**
     * Find a website by its primary domain.
     *
     * @param primaryDomain the primary domain to search for
     * @return Optional containing the website if found, empty otherwise
     */
    Optional<Website> findByPrimaryDomain(String primaryDomain);

    /**
     * Find a website by its app key.
     *
     * @param appKey the app key to search for
     * @return Optional containing the website if found, empty otherwise
     */
    Optional<Website> findByAppKey(String appKey);

    /**
     * Check if a website exists with the given primary domain.
     *
     * @param primaryDomain the primary domain to check
     * @return true if a website exists, false otherwise
     */
    boolean existsByPrimaryDomain(String primaryDomain);
}
