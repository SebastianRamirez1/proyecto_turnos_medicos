package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

interface SpringDataTurnoRepository extends JpaRepository<Turno, UUID> {

    List<Turno> findByMedicoId(UUID medicoId);

    List<Turno> findByPacienteId(UUID pacienteId);

    List<Turno> findByMedicoIdAndFechaHoraBetween(UUID medicoId, LocalDateTime desde, LocalDateTime hasta);

    List<Turno> findByEstado(EstadoTurno estado);

    // Detecta si existe un turno que se solape con el rango inicio-fin para ese médico
    // Excluye el turno con turnoIdExcluido para permitir actualizaciones
    @Query("""
        SELECT COUNT(t) > 0 FROM Turno t
        WHERE t.medico.id = :medicoId
          AND t.id <> :turnoIdExcluido
          AND t.estado NOT IN (com.clinica.turnos.domain.model.EstadoTurno.CANCELADO)
          AND t.fechaHora < :fin
          AND t.fechaHoraFin > :inicio
    """)
    boolean existsSolapamiento(
        @Param("medicoId") UUID medicoId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin,
        @Param("turnoIdExcluido") UUID turnoIdExcluido
    );
}
