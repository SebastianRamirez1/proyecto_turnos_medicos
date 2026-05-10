package com.clinica.turnos.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Clínica San Martín — API de Turnos")
                .version("1.0.0")
                .description("""
                    API REST para la gestión de turnos médicos de la Clínica San Martín.

                    Permite administrar pacientes, médicos y citas, con validaciones
                    de disponibilidad y control de estados de turno.
                    """)
                .contact(new Contact()
                    .name("Soporte Técnico")
                    .email("dev@clinicasanmartin.com"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT"))
            );
    }
}
