package com.clinica.turnos.infrastructure.persistence;

import com.clinica.turnos.domain.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface SpringDataMedicoRepository extends JpaRepository<Medico, UUID> {

    Optional<Medico> findByMatricula(String matricula);

    List<Medico> findByActivoTrue();

    List<Medico> findByEspecialidadIgnoreCaseAndActivoTrue(String especialidad);

    boolean existsByMatricula(String matricula);

    boolean existsByEmail(String email);
}
