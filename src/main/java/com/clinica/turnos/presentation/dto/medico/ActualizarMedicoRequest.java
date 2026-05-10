package com.clinica.turnos.presentation.dto.medico;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para actualizar un médico — solo se modifican los campos enviados")
public record ActualizarMedicoRequest(

    @Schema(example = "Carlos Alberto")
    @Size(max = 100)
    String nombre,

    @Schema(example = "Ramírez Ortiz")
    @Size(max = 100)
    String apellido,

    @Schema(example = "Clínica General")
    @Size(max = 100)
    String especialidad,

    @Schema(example = "carlos.nuevo@clinica.com")
    @Email(message = "El email no tiene un formato válido")
    String email,

    @Schema(example = "+54 11 8888-4321")
    String telefono
) {}
