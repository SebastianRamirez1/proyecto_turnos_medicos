package com.clinica.turnos.domain.repository;

import com.clinica.turnos.domain.model.Medico;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicoRepository {

    Medico guardar(Medico medico);

    Optional<Medico> buscarPorId(UUID id);

    Optional<Medico> buscarPorMatricula(String matricula);

    List<Medico> listarActivos();

    List<Medico> listarPorEspecialidad(String especialidad);

    boolean existePorMatricula(String matricula);

    boolean existePorEmail(String email);
}
