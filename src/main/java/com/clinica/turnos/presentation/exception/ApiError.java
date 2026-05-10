package com.clinica.turnos.presentation.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Estructura estándar de error de la API")
public record ApiError(
    @Schema(example = "2024-01-15T10:30:00") LocalDateTime timestamp,
    @Schema(example = "400") int status,
    @Schema(example = "REGLA_NEGOCIO") String codigo,
    @Schema(example = "Ya existe un paciente con ese DNI") String mensaje,
    @Schema(description = "Lista de errores de validación, presente solo en errores 400") List<String> errores
) {
    public static ApiError of(int status, String codigo, String mensaje) {
        return new ApiError(LocalDateTime.now(), status, codigo, mensaje, null);
    }

    public static ApiError withErrores(int status, String codigo, String mensaje, List<String> errores) {
        return new ApiError(LocalDateTime.now(), status, codigo, mensaje, errores);
    }
}
