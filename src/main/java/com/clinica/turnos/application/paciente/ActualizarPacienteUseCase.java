package com.clinica.turnos.application.paciente;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.repository.PacienteRepository;
import com.clinica.turnos.presentation.dto.paciente.ActualizarPacienteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActualizarPacienteUseCase {

    private final PacienteRepository repository;

    @Transactional
    public Paciente ejecutar(UUID id, ActualizarPacienteRequest request) {
        Paciente paciente = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente", id));

        if (request.email() != null && !request.email().equalsIgnoreCase(paciente.getEmail())) {
            if (repository.existePorEmail(request.email())) {
                throw new ReglaNegocioException("El email ya está en uso por otro paciente");
            }
            paciente.setEmail(request.email().toLowerCase());
        }

        if (request.nombre() != null) paciente.setNombre(request.nombre());
        if (request.apellido() != null) paciente.setApellido(request.apellido());
        if (request.telefono() != null) paciente.setTelefono(request.telefono());

        return repository.guardar(paciente);
    }
}
