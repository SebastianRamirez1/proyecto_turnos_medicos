package com.clinica.turnos.application.medico;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.repository.MedicoRepository;
import com.clinica.turnos.presentation.dto.medico.ActualizarMedicoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActualizarMedicoUseCase {

    private final MedicoRepository repository;

    @Transactional
    public Medico ejecutar(UUID id, ActualizarMedicoRequest request) {
        Medico medico = repository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Médico", id));

        if (request.email() != null && !request.email().equalsIgnoreCase(medico.getEmail())) {
            if (repository.existePorEmail(request.email())) {
                throw new ReglaNegocioException("El email ya está en uso por otro médico");
            }
            medico.setEmail(request.email().toLowerCase());
        }

        if (request.nombre() != null) medico.setNombre(request.nombre());
        if (request.apellido() != null) medico.setApellido(request.apellido());
        if (request.especialidad() != null) medico.setEspecialidad(request.especialidad());
        if (request.telefono() != null) medico.setTelefono(request.telefono());

        return repository.guardar(medico);
    }
}
