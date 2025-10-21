package com.example.demo.management_service.dao.impl;

import com.example.demo.management_service.dao.WebsiteDao;
import com.example.demo.management_service.model.Website;
import org.jdbi.v3.core.Jdbi;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JDBI implementation of WebsiteDao.
 * Uses JDBI's Handle API for database operations with proper transaction management.
 */
@Repository
public class WebsiteDaoImpl implements WebsiteDao {

    private final Jdbi jdbi;

    public WebsiteDaoImpl(Jdbi jdbi) {
        this.jdbi = jdbi;
    }

    @Override
    public Website insert(Website website) {
        return jdbi.withHandle(handle ->
                handle.createQuery("""
                    INSERT INTO websites (
                        app_key,
                        name,
                        website_type,
                        description,
                        contains_pii,
                        contact_name,
                        contact_email,
                        contact_department,
                        contact_phone,
                        primary_domain,
                        scannable_domains,
                        is_active,
                        crawl_enabled
                    ) VALUES (
                        :appKey,
                        :name,
                        :websiteType,
                        :description,
                        :containsPii,
                        :contactName,
                        :contactEmail,
                        :contactDepartment,
                        :contactPhone,
                        :primaryDomain,
                        :scannableDomainsJson::jsonb,
                        :isActive,
                        :crawlEnabled
                    )
                    RETURNING id, app_key, name, website_type, description, contains_pii,
                              contact_name, contact_email, contact_department, contact_phone,
                              primary_domain, scannable_domains::text as scannable_domains_json,
                              is_active, crawl_enabled, created_at, updated_at
                    """)
                        .bind("appKey", website.getAppKey())
                        .bind("name", website.getName())
                        .bind("websiteType", website.getWebsiteType())
                        .bind("description", website.getDescription())
                        .bind("containsPii", website.getContainsPII())
                        .bind("contactName", website.getContactName())
                        .bind("contactEmail", website.getContactEmail())
                        .bind("contactDepartment", website.getContactDepartment())
                        .bind("contactPhone", website.getContactPhone())
                        .bind("primaryDomain", website.getPrimaryDomain())
                        .bind("scannableDomainsJson", website.getScannableDomainsJson())
                        .bind("isActive", website.getIsActive())
                        .bind("crawlEnabled", website.getCrawlEnabled())
                        .mapToBean(Website.class)
                        .one()
        );
    }

    @Override
    public Optional<Website> findByPrimaryDomain(String primaryDomain) {
        return jdbi.withHandle(handle ->
                handle.createQuery("""
                    SELECT id, app_key, name, website_type, description, contains_pii,
                           contact_name, contact_email, contact_department, contact_phone,
                           primary_domain, scannable_domains::text as scannable_domains_json,
                           is_active, crawl_enabled, created_at, updated_at
                    FROM websites
                    WHERE primary_domain = :primaryDomain
                    """)
                        .bind("primaryDomain", primaryDomain)
                        .mapToBean(Website.class)
                        .findOne()
        );
    }

    @Override
    public Optional<Website> findByAppKey(String appKey) {
        return jdbi.withHandle(handle ->
                handle.createQuery("""
                    SELECT id, app_key, name, website_type, description, contains_pii,
                           contact_name, contact_email, contact_department, contact_phone,
                           primary_domain, scannable_domains::text as scannable_domains_json,
                           is_active, crawl_enabled, created_at, updated_at
                    FROM websites
                    WHERE app_key = :appKey
                    """)
                        .bind("appKey", appKey)
                        .mapToBean(Website.class)
                        .findOne()
        );
    }

    @Override
    public boolean existsByPrimaryDomain(String primaryDomain) {
        return jdbi.withHandle(handle ->
                handle.createQuery("""
                    SELECT EXISTS(
                        SELECT 1 FROM websites WHERE primary_domain = :primaryDomain
                    )
                    """)
                        .bind("primaryDomain", primaryDomain)
                        .mapTo(Boolean.class)
                        .one()
        );
    }
}
