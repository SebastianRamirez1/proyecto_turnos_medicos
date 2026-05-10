package com.clinica.turnos.presentation.dto.paciente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos requeridos para registrar un nuevo paciente")
public record CrearPacienteRequest(

    @Schema(example = "María")
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    String nombre,

    @Schema(example = "González")
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    String apellido,

    @Schema(example = "28456789")
    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{7,8}$", message = "El DNI debe tener entre 7 y 8 dígitos")
    String dni,

    @Schema(example = "maria.gonzalez@email.com")
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    String email,

    @Schema(example = "+54 11 1234-5678", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String telefono
) {}
