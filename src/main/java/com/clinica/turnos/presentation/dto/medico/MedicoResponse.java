package com.clinica.turnos.presentation.dto.medico;

import com.clinica.turnos.domain.model.Medico;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos del médico devueltos por la API")
public record MedicoResponse(
    UUID id,
    String nombre,
    String apellido,
    String nombreCompleto,
    String matricula,
    String especialidad,
    String email,
    String telefono,
    boolean activo,
    LocalDateTime creadoEn
) {
    public static MedicoResponse from(Medico m) {
        return new MedicoResponse(
            m.getId(),
            m.getNombre(),
            m.getApellido(),
            m.getNombreCompleto(),
            m.getMatricula(),
            m.getEspecialidad(),
            m.getEmail(),
            m.getTelefono(),
            m.isActivo(),
            m.getCreadoEn()
        );
    }
}
