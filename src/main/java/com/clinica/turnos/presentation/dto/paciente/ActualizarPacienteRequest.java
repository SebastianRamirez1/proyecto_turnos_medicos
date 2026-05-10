package com.clinica.turnos.presentation.dto.paciente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para actualizar un paciente — solo se modifican los campos enviados")
public record ActualizarPacienteRequest(

    @Schema(example = "María Laura")
    @Size(max = 100)
    String nombre,

    @Schema(example = "González Pérez")
    @Size(max = 100)
    String apellido,

    @Schema(example = "maria.nueva@email.com")
    @Email(message = "El email no tiene un formato válido")
    String email,

    @Schema(example = "+54 11 9999-0000")
    @Pattern(regexp = "^[+0-9\\s\\-()]{7,20}$", message = "Formato de teléfono inválido")
    String telefono
) {}
