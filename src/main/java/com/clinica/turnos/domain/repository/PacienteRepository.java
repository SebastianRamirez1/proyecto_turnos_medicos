package com.clinica.turnos.domain.repository;

import com.clinica.turnos.domain.model.Paciente;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PacienteRepository {

    Paciente guardar(Paciente paciente);

    Optional<Paciente> buscarPorId(UUID id);

    Optional<Paciente> buscarPorDni(String dni);

    Optional<Paciente> buscarPorEmail(String email);

    List<Paciente> listarActivos();

    boolean existePorDni(String dni);

    boolean existePorEmail(String email);
}
