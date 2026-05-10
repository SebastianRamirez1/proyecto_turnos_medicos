package com.clinica.turnos.presentation.dto.turno;

import com.clinica.turnos.domain.model.EstadoTurno;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para cambiar el estado de un turno")
public record CambiarEstadoRequest(

    @Schema(
        example = "CONFIRMADO",
        description = "Estado destino. Transiciones válidas: PENDIENTE→CONFIRMADO, CONFIRMADO→COMPLETADO, PENDIENTE/CONFIRMADO→CANCELADO, CONFIRMADO→AUSENTE"
    )
    @NotNull(message = "El estado es obligatorio")
    EstadoTurno nuevoEstado,

    @Schema(example = "Paciente avisó con anticipación", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String notas
) {}
