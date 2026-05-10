package com.clinica.turnos.domain.model;

import com.clinica.turnos.domain.exception.TransicionEstadoInvalidaException;
import com.clinica.turnos.util.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Turno — Máquina de estados")
class TurnoEstadoMaquinaTest {

    @Test
    @DisplayName("estado inicial es PENDIENTE")
    void estadoInicialEsPendiente() {
        Turno turno = turno();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.PENDIENTE);
    }

    @Test
    @DisplayName("PENDIENTE → CONFIRMADO es válido")
    void pendienteAConfirmadoEsValido() {
        Turno turno = turno();
        turno.confirmar();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CONFIRMADO);
    }

    @Test
    @DisplayName("CONFIRMADO → COMPLETADO es válido")
    void confirmadoACompletadoEsValido() {
        Turno turno = turno();
        turno.confirmar();
        turno.completar();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.COMPLETADO);
    }

    @Test
    @DisplayName("PENDIENTE → CANCELADO es válido")
    void pendienteACanceladoEsValido() {
        Turno turno = turno();
        turno.cancelar();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
    }

    @Test
    @DisplayName("CONFIRMADO → CANCELADO es válido")
    void confirmadoACanceladoEsValido() {
        Turno turno = turno();
        turno.confirmar();
        turno.cancelar();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
    }

    @Test
    @DisplayName("CONFIRMADO → AUSENTE es válido")
    void confirmadoAAusenteEsValido() {
        Turno turno = turno();
        turno.confirmar();
        turno.marcarAusente();
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.AUSENTE);
    }

    @Test
    @DisplayName("PENDIENTE → COMPLETADO es inválido")
    void pendienteACompletadoEsInvalido() {
        Turno turno = turno();
        assertThatThrownBy(turno::completar)
            .isInstanceOf(TransicionEstadoInvalidaException.class)
            .hasMessageContaining("PENDIENTE")
            .hasMessageContaining("COMPLETADO");
    }

    @Test
    @DisplayName("COMPLETADO → CANCELADO es inválido")
    void completadoACanceladoEsInvalido() {
        Turno turno = turno();
        turno.confirmar();
        turno.completar();
        assertThatThrownBy(turno::cancelar)
            .isInstanceOf(TransicionEstadoInvalidaException.class);
    }

    @Test
    @DisplayName("CANCELADO → CONFIRMADO es inválido")
    void canceladoAConfirmadoEsInvalido() {
        Turno turno = turno();
        turno.cancelar();
        assertThatThrownBy(turno::confirmar)
            .isInstanceOf(TransicionEstadoInvalidaException.class);
    }

    @Test
    @DisplayName("getFechaHoraFin suma la duración correctamente")
    void fechaHoraFinSumaDuracion() {
        Turno turno = turno();
        LocalDateTime inicio = turno.getFechaHora();
        assertThat(turno.getFechaHoraFin()).isEqualTo(inicio.plusMinutes(30));
    }

    private Turno turno() {
        return TestDataFactory.turno(
            TestDataFactory.paciente(),
            TestDataFactory.medico(),
            LocalDateTime.now().plusDays(1)
        );
    }
}
