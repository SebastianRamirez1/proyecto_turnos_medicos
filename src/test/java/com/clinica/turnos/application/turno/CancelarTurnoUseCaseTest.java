package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.EstadoTurno;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.TurnoRepository;
import com.clinica.turnos.util.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CancelarTurnoUseCase")
class CancelarTurnoUseCaseTest {

    @Mock TurnoRepository repository;
    @InjectMocks CancelarTurnoUseCase useCase;

    @Test
    @DisplayName("cancela exitosamente con más de 2 horas de anticipación")
    void deberiaCancelarConSuficienteAnticipacion() {
        UUID id = UUID.randomUUID();
        Turno turno = turnoEn(LocalDateTime.now().plusHours(3));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(turno));
        when(repository.guardar(any())).thenAnswer(inv -> inv.getArgument(0));

        Turno resultado = useCase.ejecutar(id, "Paciente avisó con anticipación");

        assertThat(resultado.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
        assertThat(resultado.getNotas()).isEqualTo("Paciente avisó con anticipación");
    }

    @Test
    @DisplayName("rechaza cancelación con menos de 2 horas de anticipación")
    void deberiaRechazarCancelacionTardia() {
        UUID id = UUID.randomUUID();
        Turno turno = turnoEn(LocalDateTime.now().plusMinutes(90)); // 1.5 horas — menos de 2h

        when(repository.buscarPorId(id)).thenReturn(Optional.of(turno));

        assertThatThrownBy(() -> useCase.ejecutar(id, null))
            .isInstanceOf(ReglaNegocioException.class)
            .hasMessageContaining("menos de 2 horas");

        verify(repository, never()).guardar(any());
    }

    @Test
    @DisplayName("rechaza cancelación exactamente en el límite de 2 horas")
    void deberiaRechazarEnElLimite() {
        UUID id = UUID.randomUUID();
        Turno turno = turnoEn(LocalDateTime.now().plusHours(2).minusSeconds(1));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(turno));

        assertThatThrownBy(() -> useCase.ejecutar(id, null))
            .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    @DisplayName("falla cuando el turno no existe")
    void deberiaFallarSiTurnoNoExiste() {
        UUID id = UUID.randomUUID();
        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.ejecutar(id, null))
            .isInstanceOf(RecursoNoEncontradoException.class)
            .hasMessageContaining("Turno");
    }

    private Turno turnoEn(LocalDateTime fechaHora) {
        return TestDataFactory.turno(
            TestDataFactory.paciente(),
            TestDataFactory.medico(),
            fechaHora
        );
    }
}
