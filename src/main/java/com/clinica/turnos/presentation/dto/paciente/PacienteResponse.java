package com.clinica.turnos.presentation.dto.paciente;

import com.clinica.turnos.domain.model.Paciente;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos del paciente devueltos por la API")
public record PacienteResponse(
    UUID id,
    String nombre,
    String apellido,
    String nombreCompleto,
    String dni,
    String email,
    String telefono,
    boolean activo,
    LocalDateTime creadoEn
) {
    public static PacienteResponse from(Paciente p) {
        return new PacienteResponse(
            p.getId(),
            p.getNombre(),
            p.getApellido(),
            p.getNombreCompleto(),
            p.getDni(),
            p.getEmail(),
            p.getTelefono(),
            p.isActivo(),
            p.getCreadoEn()
        );
    }
}
