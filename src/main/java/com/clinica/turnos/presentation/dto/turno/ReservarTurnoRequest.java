package com.clinica.turnos.presentation.dto.turno;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos requeridos para reservar un turno")
public record ReservarTurnoRequest(

    @Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    @NotNull(message = "El ID del paciente es obligatorio")
    UUID pacienteId,

    @Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    @NotNull(message = "El ID del médico es obligatorio")
    UUID medicoId,

    @Schema(example = "2024-06-15T10:00:00", description = "Debe ser una fecha futura")
    @NotNull(message = "La fecha y hora son obligatorias")
    @Future(message = "La fecha del turno debe ser en el futuro")
    LocalDateTime fechaHora,

    @Schema(example = "30", description = "Duración en minutos, mínimo 15")
    @Min(value = 15, message = "La duración mínima es de 15 minutos")
    int duracionMinutos,

    @Schema(example = "Control de presión arterial", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String motivo
) {}
