package com.example.demo.navigation_service.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Database configuration for Netty-based reactive application.
 *
 * This configuration provides:
 * - Flyway configuration customization for reactive setup
 * - R2DBC remains the primary reactive database access
 * - No JDBC DataSource to avoid conflicts with reactive stack
 */
@Configuration
public class DatabaseConfig {

    /**
     * Flyway configuration for Netty reactive setup.
     * Ensures migrations run without affecting the reactive stack.
     * Flyway will use its own DataSource from application.properties.
     */
    @Bean
    @ConditionalOnClass(Flyway.class)
    public FlywayConfigurationCustomizer flywayConfigurationCustomizer() {
        return configuration -> {
            // Migration settings for reactive setup
            configuration.baselineOnMigrate(true);
            configuration.baselineVersion("0");
            configuration.validateOnMigrate(false);
            configuration.outOfOrder(true);
            configuration.locations("classpath:db/migration");

            // Ensure clean separation from reactive components
            configuration.cleanDisabled(false);
        };
    }
}
