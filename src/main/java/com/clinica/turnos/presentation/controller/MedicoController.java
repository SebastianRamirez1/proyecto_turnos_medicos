package com.clinica.turnos.presentation.controller;

import com.clinica.turnos.application.medico.*;
import com.clinica.turnos.presentation.dto.medico.ActualizarMedicoRequest;
import com.clinica.turnos.presentation.dto.medico.CrearMedicoRequest;
import com.clinica.turnos.presentation.dto.medico.MedicoResponse;
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
@RequestMapping("/api/v1/medicos")
@RequiredArgsConstructor
@Tag(name = "Médicos", description = "Gestión de médicos de la clínica")
public class MedicoController {

    private final CrearMedicoUseCase crearMedico;
    private final ObtenerMedicoUseCase obtenerMedico;
    private final ActualizarMedicoUseCase actualizarMedico;
    private final DesactivarMedicoUseCase desactivarMedico;

    @PostMapping
    @Operation(summary = "Registrar un nuevo médico")
    public ResponseEntity<MedicoResponse> crear(@Valid @RequestBody CrearMedicoRequest request) {
        var medico = crearMedico.ejecutar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(MedicoResponse.from(medico));
    }

    @GetMapping
    @Operation(summary = "Listar todos los médicos activos")
    public ResponseEntity<List<MedicoResponse>> listar() {
        var medicos = obtenerMedico.listarActivos().stream()
            .map(MedicoResponse::from)
            .toList();
        return ResponseEntity.ok(medicos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un médico por ID")
    public ResponseEntity<MedicoResponse> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(MedicoResponse.from(obtenerMedico.porId(id)));
    }

    @GetMapping("/especialidad/{especialidad}")
    @Operation(summary = "Listar médicos activos por especialidad")
    public ResponseEntity<List<MedicoResponse>> listarPorEspecialidad(@PathVariable String especialidad) {
        var medicos = obtenerMedico.listarPorEspecialidad(especialidad).stream()
            .map(MedicoResponse::from)
            .toList();
        return ResponseEntity.ok(medicos);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar datos de un médico")
    public ResponseEntity<MedicoResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarMedicoRequest request) {
        var medico = actualizarMedico.ejecutar(id, request);
        return ResponseEntity.ok(MedicoResponse.from(medico));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar un médico (soft delete)")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        desactivarMedico.ejecutar(id);
        return ResponseEntity.noContent().build();
    }
}
