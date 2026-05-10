package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface SpringDataPacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByDni(String dni);

    Optional<Paciente> findByEmail(String email);

    List<Paciente> findByActivoTrue();

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);
}
