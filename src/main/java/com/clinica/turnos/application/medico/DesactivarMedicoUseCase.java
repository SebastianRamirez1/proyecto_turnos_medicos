package com.clinica.turnos.application.medico;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DesactivarMedicoUseCase {

    private final MedicoRepository repository;

    @Transactional
    public void ejecutar(UUID id) {
        Medico medico = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Médico", id));

        medico.setActivo(false);
        repository.guardar(medico);
    }
}
