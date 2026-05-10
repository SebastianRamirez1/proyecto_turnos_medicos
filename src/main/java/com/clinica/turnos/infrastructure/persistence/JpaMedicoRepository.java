package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaMedicoRepository implements MedicoRepository {

    private final SpringDataMedicoRepository spring;

    @Override
    public Medico guardar(Medico medico) {
        return spring.save(medico);
    }

    @Override
    public Optional<Medico> buscarPorId(UUID id) {
        return spring.findById(id);
    }

    @Override
    public Optional<Medico> buscarPorMatricula(String matricula) {
        return spring.findByMatricula(matricula);
    }

    @Override
    public List<Medico> listarActivos() {
        return spring.findByActivoTrue();
    }

    @Override
    public List<Medico> listarPorEspecialidad(String especialidad) {
        return spring.findByEspecialidadIgnoreCaseAndActivoTrue(especialidad);
    }

    @Override
    public boolean existePorMatricula(String matricula) {
        return spring.existsByMatricula(matricula);
    }

    @Override
    public boolean existePorEmail(String email) {
        return spring.existsByEmail(email);
    }
}
