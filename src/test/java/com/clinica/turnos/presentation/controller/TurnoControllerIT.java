package com.clinica.turnos.presentation.controller;

import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.presentation.dto.medico.CrearMedicoRequest;
import com.clinica.turnos.presentation.dto.paciente.CrearPacienteRequest;
import com.clinica.turnos.presentation.dto.turno.CambiarEstadoRequest;
import com.clinica.turnos.presentation.dto.turno.ReservarTurnoRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("TurnoController — Integration Tests")
class TurnoControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private UUID pacienteId;
    private UUID medicoId;

    @BeforeEach
    void setUp() throws Exception {
        pacienteId = crearPaciente("28456789", "maria@test.com");
        medicoId   = crearMedico("MP-12345", "carlos@clinica.com");
    }

    @Test
    @DisplayName("POST /api/v1/turnos — reserva exitosa retorna 201")
    void deberiaReservarTurno() throws Exception {
        var request = reservaEn(LocalDateTime.now().plusDays(1));

        mockMvc.perform(post("/api/v1/turnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.estado").value("PENDIENTE"))
            .andExpect(jsonPath("$.pacienteId").value(pacienteId.toString()))
            .andExpect(jsonPath("$.medicoId").value(medicoId.toString()))
            .andExpect(jsonPath("$.fechaHoraFin").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/turnos — retorna 409 con solapamiento de horario")
    void deberiaRechazarSolapamiento() throws Exception {
        LocalDateTime horario = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);

        mockMvc.perform(post("/api/v1/turnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaEn(horario))))
            .andExpect(status().isCreated());

        // Segundo turno en el mismo horario para el mismo médico
        mockMvc.perform(post("/api/v1/turnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaEn(horario))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.codigo").value("REGLA_NEGOCIO"));
    }

    @Test
    @DisplayName("PATCH /api/v1/turnos/{id}/estado — PENDIENTE a CONFIRMADO")
    void deberiaCambiarEstadoAConfirmado() throws Exception {
        String turnoJson = mockMvc.perform(post("/api/v1/turnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaEn(LocalDateTime.now().plusDays(1)))))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        String turnoId = objectMapper.readTree(turnoJson).get("id").asText();
        var cambio = new CambiarEstadoRequest(EstadoTurno.CONFIRMADO, null);

        mockMvc.perform(patch("/api/v1/turnos/" + turnoId + "/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cambio)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("CONFIRMADO"));
    }

    @Test
    @DisplayName("PATCH /api/v1/turnos/{id}/estado — transición inválida retorna 422")
    void deberiaRechazarTransicionInvalida() throws Exception {
        String turnoJson = mockMvc.perform(post("/api/v1/turnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaEn(LocalDateTime.now().plusDays(1)))))
            .andReturn().getResponse().getContentAsString();

        String turnoId = objectMapper.readTree(turnoJson).get("id").asText();
        // PENDIENTE → COMPLETADO es inválido
        var cambio = new CambiarEstadoRequest(EstadoTurno.COMPLETADO, null);

        mockMvc.perform(patch("/api/v1/turnos/" + turnoId + "/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cambio)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    // — Helpers —

    private ReservarTurnoRequest reservaEn(LocalDateTime fechaHora) {
        return new ReservarTurnoRequest(pacienteId, medicoId, fechaHora, 30, "Control");
    }

    private UUID crearPaciente(String dni, String email) throws Exception {
        var req = new CrearPacienteRequest("María", "González", dni, email, null);
        String resp = mockMvc.perform(post("/api/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andReturn().getResponse().getContentAsString();
        return UUID.fromString(objectMapper.readTree(resp).get("id").asText());
    }

    private UUID crearMedico(String matricula, String email) throws Exception {
        var req = new CrearMedicoRequest("Carlos", "Ramírez", matricula, "Cardiología", email, null);
        String resp = mockMvc.perform(post("/api/v1/medicos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andReturn().getResponse().getContentAsString();
        return UUID.fromString(objectMapper.readTree(resp).get("id").asText());
    }
}
