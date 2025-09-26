package com.example.demo.navigation_service.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

/**
 * Database configuration for Netty-based reactive application.
 *
 * This configuration provides:
 * - Isolated JDBC DataSource only for Flyway migrations
 * - R2DBC remains the primary reactive database access
 * - No interference with Netty server configuration
 */
@Configuration
public class DatabaseConfig {

    @Value("${spring.flyway.url}")
    private String flywayUrl;

    @Value("${spring.flyway.user}")
    private String flywayUser;

    @Value("${spring.flyway.password}")
    private String flywayPassword;

    /**
     * Dedicated DataSource for Flyway migrations only.
     * This is completely isolated from the reactive R2DBC setup.
     */
    @Bean(name = "flywayDataSource")
    @ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
    @ConditionalOnClass(Flyway.class)
    public DataSource flywayDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(flywayUrl);
        dataSource.setUsername(flywayUser);
        dataSource.setPassword(flywayPassword);
        return dataSource;
    }

    /**
     * Flyway configuration for Netty reactive setup.
     * Ensures migrations run without affecting the reactive stack.
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
            configuration.ignoreMissingMigrations(true);
            configuration.locations("classpath:db/migration");

            // Ensure clean separation from reactive components
            configuration.cleanDisabled(false);
            configuration.loggers("slf4j");
        };
    }
}
