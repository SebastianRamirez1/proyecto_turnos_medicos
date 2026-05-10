package com.clinica.turnos.domain.repository;

import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TurnoRepository {

    Turno guardar(Turno turno);

    Optional<Turno> buscarPorId(UUID id);

    List<Turno> listarPorMedico(UUID medicoId);

    List<Turno> listarPorPaciente(UUID pacienteId);

    List<Turno> listarPorMedicoYFecha(UUID medicoId, LocalDateTime desde, LocalDateTime hasta);

    // Verifica si existe un turno solapado para un médico en un rango de tiempo
    boolean existeSolapamiento(UUID medicoId, LocalDateTime inicio, LocalDateTime fin, UUID turnoIdExcluido);

    List<Turno> listarPorEstado(EstadoTurno estado);
}
