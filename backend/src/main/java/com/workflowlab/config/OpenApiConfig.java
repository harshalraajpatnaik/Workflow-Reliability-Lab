package com.workflowlab.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Workflow Reliability Lab API")
                .description("Developer platform for understanding, testing, diagnosing and improving the reliability of distributed workflows and asynchronous systems.")
                .version("1.0.0")
                .contact(new Contact().name("Workflow Reliability Lab Team").email("api@workflowlab.dev"))
                .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")))
            .addSecurityItem(new SecurityRequirement().addList("BearerAuth").addList("ApiKeyAuth"))
            .components(new Components()
                .addSecuritySchemes("BearerAuth", new SecurityScheme()
                    .name("BearerAuth")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT Access Token received upon login"))
                .addSecuritySchemes("ApiKeyAuth", new SecurityScheme()
                    .name("X-API-Key")
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.HEADER)
                    .description("Workspace-scoped API Key for machine-to-machine ingestion")));
    }
}
