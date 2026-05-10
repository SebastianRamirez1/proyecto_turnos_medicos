package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.MedicoRepository;
import com.clinica.turnos.domain.repository.PacienteRepository;
import com.clinica.turnos.domain.repository.TurnoRepository;
import com.clinica.turnos.presentation.dto.turno.ReservarTurnoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReservarTurnoUseCase {

    private final TurnoRepository turnoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    @Transactional
    public Turno ejecutar(ReservarTurnoRequest request) {
        var paciente = pacienteRepository.buscarPorId(request.pacienteId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente", request.pacienteId()));

        var medico = medicoRepository.buscarPorId(request.medicoId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Médico", request.medicoId()));

        if (!paciente.isActivo()) {
            throw new ReglaNegocioException("El paciente no está activo en el sistema");
        }
        if (!medico.isActivo()) {
            throw new ReglaNegocioException("El médico no está disponible en el sistema");
        }

        LocalDateTime inicio = request.fechaHora();
        LocalDateTime fin = inicio.plusMinutes(request.duracionMinutos());

        // UUID nil como placeholder para "ningún turno excluido" en la query de solapamiento
        boolean haySolapamiento = turnoRepository.existeSolapamiento(
            medico.getId(), inicio, fin,
            new java.util.UUID(0L, 0L)
        );

        if (haySolapamiento) {
            throw new ReglaNegocioException(
                "El médico %s ya tiene un turno en ese horario. Por favor elija otro horario."
                    .formatted(medico.getNombreCompleto())
            );
        }

        Turno turno = new Turno();
        turno.setPaciente(paciente);
        turno.setMedico(medico);
        turno.setFechaHora(inicio);
        turno.setDuracionMinutos(request.duracionMinutos());
        turno.setMotivo(request.motivo());

        return turnoRepository.guardar(turno);
    }
}
