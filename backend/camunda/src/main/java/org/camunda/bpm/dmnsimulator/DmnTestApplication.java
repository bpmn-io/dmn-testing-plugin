package org.camunda.bpm.dmnsimulator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication
@EnableWebSecurity
public class DmnTestApplication {

	public static void main(String[] args) {
		SpringApplication.run(DmnTestApplication.class, args);
	}
}
