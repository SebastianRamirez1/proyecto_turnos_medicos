package com.clinica.turnos.application.medico;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ObtenerMedicoUseCase {

    private final MedicoRepository repository;

    @Transactional(readOnly = true)
    public Medico porId(UUID id) {
        return repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Médico", id));
    }

    @Transactional(readOnly = true)
    public List<Medico> listarActivos() {
        return repository.listarActivos();
    }

    @Transactional(readOnly = true)
    public List<Medico> listarPorEspecialidad(String especialidad) {
        return repository.listarPorEspecialidad(especialidad);
    }
}
