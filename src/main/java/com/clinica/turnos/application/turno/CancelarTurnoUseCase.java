package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CancelarTurnoUseCase {

    private static final int HORAS_MINIMAS_ANTICIPACION = 2;

    private final TurnoRepository repository;

    @Transactional
    public Turno ejecutar(UUID id, String notas) {
        Turno turno = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Turno", id));

        LocalDateTime limiteParaCancelar = turno.getFechaHora()
            .minusHours(HORAS_MINIMAS_ANTICIPACION);

        if (LocalDateTime.now().isAfter(limiteParaCancelar)) {
            throw new ReglaNegocioException(
                "No se puede cancelar el turno con menos de %d horas de anticipación"
                    .formatted(HORAS_MINIMAS_ANTICIPACION)
            );
        }

        turno.cancelar();
        if (notas != null) turno.setNotas(notas);

        return repository.guardar(turno);
    }
}
