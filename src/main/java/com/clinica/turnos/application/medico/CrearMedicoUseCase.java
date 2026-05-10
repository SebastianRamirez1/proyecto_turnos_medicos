package com.clinica.turnos.application.medico;

import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.repository.MedicoRepository;
import com.clinica.turnos.presentation.dto.medico.CrearMedicoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CrearMedicoUseCase {

    private final MedicoRepository repository;

    @Transactional
    public Medico ejecutar(CrearMedicoRequest request) {
        if (repository.existePorMatricula(request.matricula())) {
            throw new ReglaNegocioException("Ya existe un médico con la matrícula: " + request.matricula());
        }
        if (repository.existePorEmail(request.email())) {
            throw new ReglaNegocioException("Ya existe un médico registrado con el email: " + request.email());
        }

        Medico medico = new Medico();
        medico.setNombre(request.nombre());
        medico.setApellido(request.apellido());
        medico.setMatricula(request.matricula());
        medico.setEspecialidad(request.especialidad());
        medico.setEmail(request.email().toLowerCase());
        medico.setTelefono(request.telefono());

        return repository.guardar(medico);
    }
}
