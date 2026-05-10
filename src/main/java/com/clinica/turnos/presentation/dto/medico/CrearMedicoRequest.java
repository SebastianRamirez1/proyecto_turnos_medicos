package com.clinica.turnos.presentation.dto.medico;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos requeridos para registrar un nuevo médico")
public record CrearMedicoRequest(

    @Schema(example = "Carlos")
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    String nombre,

    @Schema(example = "Ramírez")
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    String apellido,

    @Schema(example = "MP-12345")
    @NotBlank(message = "La matrícula es obligatoria")
    @Size(max = 50)
    String matricula,

    @Schema(example = "Cardiología")
    @NotBlank(message = "La especialidad es obligatoria")
    @Size(max = 100)
    String especialidad,

    @Schema(example = "carlos.ramirez@clinica.com")
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    String email,

    @Schema(example = "+54 11 5555-1234", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String telefono
) {}
