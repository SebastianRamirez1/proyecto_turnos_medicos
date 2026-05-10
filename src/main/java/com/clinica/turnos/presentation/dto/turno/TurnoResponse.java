package com.clinica.turnos.presentation.dto.turno;

import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos del turno devueltos por la API")
public record TurnoResponse(
    UUID id,
    UUID pacienteId,
    String pacienteNombre,
    UUID medicoId,
    String medicoNombre,
    String especialidad,
    LocalDateTime fechaHora,
    LocalDateTime fechaHoraFin,
    int duracionMinutos,
    EstadoTurno estado,
    String motivo,
    String notas,
    LocalDateTime creadoEn
) {
    public static TurnoResponse from(Turno t) {
        return new TurnoResponse(
            t.getId(),
            t.getPaciente().getId(),
            t.getPaciente().getNombreCompleto(),
            t.getMedico().getId(),
            t.getMedico().getNombreCompleto(),
            t.getMedico().getEspecialidad(),
            t.getFechaHora(),
            t.getFechaHoraFin(),
            t.getDuracionMinutos(),
            t.getEstado(),
            t.getMotivo(),
            t.getNotas(),
            t.getCreadoEn()
        );
    }
}
