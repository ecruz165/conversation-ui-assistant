package com.example.demo.management_service.config;

import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.postgres.PostgresPlugin;
import org.jdbi.v3.sqlobject.SqlObjectPlugin;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Configuration class for JDBI.
 * Sets up JDBI with PostgreSQL support and SQL Object plugin for database access.
 */
@Configuration
public class JdbiConfiguration {

    /**
     * Creates and configures the JDBI instance.
     *
     * @param dataSource the Spring-managed DataSource
     * @return configured Jdbi instance with PostgreSQL and SqlObject plugins
     */
    @Bean
    public Jdbi jdbi(DataSource dataSource) {
        return Jdbi.create(dataSource)
                .installPlugin(new PostgresPlugin())
                .installPlugin(new SqlObjectPlugin());
    }
}
