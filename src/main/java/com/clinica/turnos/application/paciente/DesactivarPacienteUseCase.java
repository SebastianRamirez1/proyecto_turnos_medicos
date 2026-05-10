package com.clinica.turnos.application.paciente;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DesactivarPacienteUseCase {

    private final PacienteRepository repository;

    // Soft delete — los datos médicos nunca se eliminan físicamente
    @Transactional
    public void ejecutar(UUID id) {
        Paciente paciente = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente", id));

        paciente.setActivo(false);
        repository.guardar(paciente);
    }
}
