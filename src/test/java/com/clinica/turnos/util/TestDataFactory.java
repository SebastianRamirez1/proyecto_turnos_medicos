package com.clinica.turnos.util;

import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.model.Turno;

import java.time.LocalDateTime;
import java.util.UUID;

public final class TestDataFactory {

    private TestDataFactory() {}

    public static Paciente paciente() {
        Paciente p = new Paciente();
        p.setNombre("María");
        p.setApellido("González");
        p.setDni("28456789");
        p.setEmail("maria@test.com");
        p.setTelefono("+54 11 1234-5678");
        return p;
    }

    public static Medico medico() {
        Medico m = new Medico();
        m.setNombre("Carlos");
        m.setApellido("Ramírez");
        m.setMatricula("MP-12345");
        m.setEspecialidad("Cardiología");
        m.setEmail("carlos@clinica.com");
        return m;
    }

    public static Turno turno(Paciente paciente, Medico medico, LocalDateTime fechaHora) {
        Turno t = new Turno();
        t.setPaciente(paciente);
        t.setMedico(medico);
        t.setFechaHora(fechaHora);
        t.setDuracionMinutos(30);
        t.setMotivo("Control de rutina");
        return t;
    }

    public static UUID randomId() {
        return UUID.randomUUID();
    }
}
