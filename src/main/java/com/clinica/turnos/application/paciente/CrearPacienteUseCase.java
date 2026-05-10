package com.clinica.turnos.application.paciente;

import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.repository.PacienteRepository;
import com.clinica.turnos.presentation.dto.paciente.CrearPacienteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CrearPacienteUseCase {

    private final PacienteRepository repository;

    @Transactional
    public Paciente ejecutar(CrearPacienteRequest request) {
        if (repository.existePorDni(request.dni())) {
            throw new ReglaNegocioException("Ya existe un paciente registrado con el DNI: " + request.dni());
        }
        if (repository.existePorEmail(request.email())) {
            throw new ReglaNegocioException("Ya existe un paciente registrado con el email: " + request.email());
        }

        Paciente paciente = new Paciente();
        paciente.setNombre(request.nombre());
        paciente.setApellido(request.apellido());
        paciente.setDni(request.dni());
        paciente.setEmail(request.email().toLowerCase());
        paciente.setTelefono(request.telefono());

        return repository.guardar(paciente);
    }
}
