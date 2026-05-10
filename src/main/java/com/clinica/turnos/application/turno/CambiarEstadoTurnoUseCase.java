package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.TurnoRepository;
import com.clinica.turnos.presentation.dto.turno.CambiarEstadoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CambiarEstadoTurnoUseCase {

    private final TurnoRepository repository;

    @Transactional
    public Turno ejecutar(UUID id, CambiarEstadoRequest request) {
        Turno turno = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Turno", id));

        // La máquina de estados vive en el dominio — aquí solo despachamos
        switch (request.nuevoEstado()) {
            case CONFIRMADO -> turno.confirmar();
            case COMPLETADO -> turno.completar();
            case CANCELADO  -> turno.cancelar();
            case AUSENTE    -> turno.marcarAusente();
            default -> throw new IllegalArgumentException(
                "Transición a estado %s no soportada por este endpoint".formatted(request.nuevoEstado())
            );
        }

        if (request.notas() != null) turno.setNotas(request.notas());

        return repository.guardar(turno);
    }
}
