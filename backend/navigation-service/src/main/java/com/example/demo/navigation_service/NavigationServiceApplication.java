package com.example.demo.navigation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

/**
 * Navigation Service - Reactive Spring Boot Application
 *
 * Runs on Netty with WebFlux and R2DBC for fully reactive stack.
 * JDBC auto-configuration is excluded to prevent conflicts with reactive setup.
 */
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class
})
public class NavigationServiceApplication {

	public static void main(String[] args) {
		// Ensure reactive web application type
		SpringApplication app = new SpringApplication(NavigationServiceApplication.class);
		app.setWebApplicationType(org.springframework.boot.WebApplicationType.REACTIVE);
		app.run(args);
	}

}
