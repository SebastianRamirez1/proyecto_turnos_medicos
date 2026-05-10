package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaPacienteRepository implements PacienteRepository {

    private final SpringDataPacienteRepository spring;

    @Override
    public Paciente guardar(Paciente paciente) {
        return spring.save(paciente);
    }

    @Override
    public Optional<Paciente> buscarPorId(UUID id) {
        return spring.findById(id);
    }

    @Override
    public Optional<Paciente> buscarPorDni(String dni) {
        return spring.findByDni(dni);
    }

    @Override
    public Optional<Paciente> buscarPorEmail(String email) {
        return spring.findByEmail(email);
    }

    @Override
    public List<Paciente> listarActivos() {
        return spring.findByActivoTrue();
    }

    @Override
    public boolean existePorDni(String dni) {
        return spring.existsByDni(dni);
    }

    @Override
    public boolean existePorEmail(String email) {
        return spring.existsByEmail(email);
    }
}
