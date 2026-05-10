package com.clinica.turnos.presentation.controller;

import com.clinica.turnos.application.paciente.*;
import com.clinica.turnos.presentation.dto.paciente.ActualizarPacienteRequest;
import com.clinica.turnos.presentation.dto.paciente.CrearPacienteRequest;
import com.clinica.turnos.presentation.dto.paciente.PacienteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pacientes")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Gestión de pacientes de la clínica")
public class PacienteController {

    private final CrearPacienteUseCase crearPaciente;
    private final ObtenerPacienteUseCase obtenerPaciente;
    private final ActualizarPacienteUseCase actualizarPaciente;
    private final DesactivarPacienteUseCase desactivarPaciente;

    @PostMapping
    @Operation(summary = "Registrar un nuevo paciente")
    public ResponseEntity<PacienteResponse> crear(@Valid @RequestBody CrearPacienteRequest request) {
        var paciente = crearPaciente.ejecutar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(PacienteResponse.from(paciente));
    }

    @GetMapping
    @Operation(summary = "Listar todos los pacientes activos")
    public ResponseEntity<List<PacienteResponse>> listar() {
        var pacientes = obtenerPaciente.listarActivos().stream()
            .map(PacienteResponse::from)
            .toList();
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un paciente por ID")
    public ResponseEntity<PacienteResponse> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(PacienteResponse.from(obtenerPaciente.porId(id)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar datos de un paciente")
    public ResponseEntity<PacienteResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarPacienteRequest request) {
        var paciente = actualizarPaciente.ejecutar(id, request);
        return ResponseEntity.ok(PacienteResponse.from(paciente));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar un paciente (soft delete)")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        desactivarPaciente.ejecutar(id);
        return ResponseEntity.noContent().build();
    }
}
