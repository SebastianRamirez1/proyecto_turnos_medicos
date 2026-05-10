package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ObtenerTurnoUseCase {

    private final TurnoRepository repository;

    @Transactional(readOnly = true)
    public Turno porId(UUID id) {
        return repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Turno", id));
    }

    @Transactional(readOnly = true)
    public List<Turno> porMedico(UUID medicoId) {
        return repository.listarPorMedico(medicoId);
    }

    @Transactional(readOnly = true)
    public List<Turno> porPaciente(UUID pacienteId) {
        return repository.listarPorPaciente(pacienteId);
    }

    @Transactional(readOnly = true)
    public List<Turno> agendaMedico(UUID medicoId, LocalDateTime desde, LocalDateTime hasta) {
        return repository.listarPorMedicoYFecha(medicoId, desde, hasta);
    }
}
