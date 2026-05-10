package com.clinica.turnos.presentation.controller;

import com.clinica.turnos.presentation.dto.paciente.CrearPacienteRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("PacienteController — Integration Tests")
class PacienteControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/pacientes — crea paciente y retorna 201")
    void deberiaCrearPaciente() throws Exception {
        var request = new CrearPacienteRequest(
            "María", "González", "28456789",
            "maria@test.com", "+54 11 1234-5678"
        );

        mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.nombreCompleto").value("González, María"))
            .andExpect(jsonPath("$.dni").value("28456789"))
            .andExpect(jsonPath("$.activo").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/pacientes — retorna 409 con DNI duplicado")
    void deberiaRetornar409ConDniDuplicado() throws Exception {
        var request = new CrearPacienteRequest(
            "María", "González", "28456789",
            "maria@test.com", null
        );

        mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        var duplicado = new CrearPacienteRequest(
            "Pedro", "López", "28456789",
            "pedro@test.com", null
        );

        mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicado)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.codigo").value("REGLA_NEGOCIO"))
            .andExpect(jsonPath("$.mensaje").value(containsString("28456789")));
    }

    @Test
    @DisplayName("POST /api/v1/pacientes — retorna 400 con email inválido")
    void deberiaRetornar400ConEmailInvalido() throws Exception {
        var request = new CrearPacienteRequest(
            "María", "González", "28456789",
            "no-es-un-email", null
        );

        mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores").isArray())
            .andExpect(jsonPath("$.errores", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/pacientes/{id} — retorna 404 si no existe")
    void deberiaRetornar404SiPacienteNoExiste() throws Exception {
        mockMvc.perform(get("/api/v1/pacientes/00000000-0000-0000-0000-000000000000"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.codigo").value("RECURSO_NO_ENCONTRADO"));
    }

    @Test
    @DisplayName("DELETE /api/v1/pacientes/{id} — soft delete retorna 204")
    void deberiaDesactivarPaciente() throws Exception {
        var request = new CrearPacienteRequest(
            "María", "González", "28456789",
            "maria@test.com", null
        );

        String response = mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/api/v1/pacientes/" + id))
            .andExpect(status().isNoContent());

        // El paciente desactivado no aparece en el listado
        mockMvc.perform(get("/api/v1/pacientes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }
}
