package com.clinica.turnos.application.paciente;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ObtenerPacienteUseCase {

    private final PacienteRepository repository;

    @Transactional(readOnly = true)
    public Paciente porId(UUID id) {
        return repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente", id));
    }

    @Transactional(readOnly = true)
    public List<Paciente> listarActivos() {
        return repository.listarActivos();
    }
}
