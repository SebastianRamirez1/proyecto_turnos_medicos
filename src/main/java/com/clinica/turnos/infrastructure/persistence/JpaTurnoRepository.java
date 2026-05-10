package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaTurnoRepository implements TurnoRepository {

    private final SpringDataTurnoRepository spring;

    @Override
    public Turno guardar(Turno turno) {
        return spring.save(turno);
    }

    @Override
    public Optional<Turno> buscarPorId(UUID id) {
        return spring.findById(id);
    }

    @Override
    public List<Turno> listarPorMedico(UUID medicoId) {
        return spring.findByMedicoId(medicoId);
    }

    @Override
    public List<Turno> listarPorPaciente(UUID pacienteId) {
        return spring.findByPacienteId(pacienteId);
    }

    @Override
    public List<Turno> listarPorMedicoYFecha(UUID medicoId, LocalDateTime desde, LocalDateTime hasta) {
        return spring.findByMedicoIdAndFechaHoraBetween(medicoId, desde, hasta);
    }

    @Override
    public boolean existeSolapamiento(UUID medicoId, LocalDateTime inicio, LocalDateTime fin, UUID turnoIdExcluido) {
        return spring.existsSolapamiento(medicoId, inicio, fin, turnoIdExcluido);
    }

    @Override
    public List<Turno> listarPorEstado(EstadoTurno estado) {
        return spring.findByEstado(estado);
    }
}
