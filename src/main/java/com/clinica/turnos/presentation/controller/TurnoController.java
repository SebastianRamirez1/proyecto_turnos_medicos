package com.clinica.turnos.presentation.controller;

import com.clinica.turnos.application.turno.*;
import com.clinica.turnos.presentation.dto.turno.CambiarEstadoRequest;
import com.clinica.turnos.presentation.dto.turno.ReservarTurnoRequest;
import com.clinica.turnos.presentation.dto.turno.TurnoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/turnos")
@RequiredArgsConstructor
@Tag(name = "Turnos", description = "Gestión de citas médicas — reserva, cancelación y seguimiento de estado")
public class TurnoController {

    private final ReservarTurnoUseCase reservarTurno;
    private final CancelarTurnoUseCase cancelarTurno;
    private final CambiarEstadoTurnoUseCase cambiarEstado;
    private final ObtenerTurnoUseCase obtenerTurno;

    @PostMapping
    @Operation(
        summary = "Reservar un turno",
        description = "Crea un nuevo turno. Valida que el médico no tenga otro turno solapado en ese horario."
    )
    public ResponseEntity<TurnoResponse> reservar(@Valid @RequestBody ReservarTurnoRequest request) {
        var turno = reservarTurno.ejecutar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TurnoResponse.from(turno));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un turno por ID")
    public ResponseEntity<TurnoResponse> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(TurnoResponse.from(obtenerTurno.porId(id)));
    }

    @GetMapping("/medico/{medicoId}")
    @Operation(summary = "Listar todos los turnos de un médico")
    public ResponseEntity<List<TurnoResponse>> porMedico(@PathVariable UUID medicoId) {
        var turnos = obtenerTurno.porMedico(medicoId).stream()
            .map(TurnoResponse::from)
            .toList();
        return ResponseEntity.ok(turnos);
    }

    @GetMapping("/paciente/{pacienteId}")
    @Operation(summary = "Listar todos los turnos de un paciente")
    public ResponseEntity<List<TurnoResponse>> porPaciente(@PathVariable UUID pacienteId) {
        var turnos = obtenerTurno.porPaciente(pacienteId).stream()
            .map(TurnoResponse::from)
            .toList();
        return ResponseEntity.ok(turnos);
    }

    @GetMapping("/medico/{medicoId}/agenda")
    @Operation(
        summary = "Ver agenda de un médico en un rango de fechas",
        description = "Útil para mostrar disponibilidad. Formato de fecha: yyyy-MM-dd'T'HH:mm:ss"
    )
    public ResponseEntity<List<TurnoResponse>> agenda(
            @PathVariable UUID medicoId,
            @Parameter(example = "2024-06-01T00:00:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @Parameter(example = "2024-06-30T23:59:59")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {

        var turnos = obtenerTurno.agendaMedico(medicoId, desde, hasta).stream()
            .map(TurnoResponse::from)
            .toList();
        return ResponseEntity.ok(turnos);
    }

    @PatchMapping("/{id}/estado")
    @Operation(
        summary = "Cambiar el estado de un turno",
        description = "Transiciones válidas: PENDIENTE→CONFIRMADO, CONFIRMADO→COMPLETADO, PENDIENTE/CONFIRMADO→CANCELADO, CONFIRMADO→AUSENTE"
    )
    public ResponseEntity<TurnoResponse> cambiarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody CambiarEstadoRequest request) {
        var turno = cambiarEstado.ejecutar(id, request);
        return ResponseEntity.ok(TurnoResponse.from(turno));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Cancelar un turno",
        description = "Solo se puede cancelar con al menos 2 horas de anticipación."
    )
    public ResponseEntity<TurnoResponse> cancelar(
            @PathVariable UUID id,
            @RequestParam(required = false) String notas) {
        var turno = cancelarTurno.ejecutar(id, notas);
        return ResponseEntity.ok(TurnoResponse.from(turno));
    }
}
