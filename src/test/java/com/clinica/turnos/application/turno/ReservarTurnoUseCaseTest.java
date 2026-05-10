package com.clinica.turnos.application.turno;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.model.Medico;
import com.clinica.turnos.domain.model.Paciente;
import com.clinica.turnos.domain.model.Turno;
import com.clinica.turnos.domain.repository.MedicoRepository;
import com.clinica.turnos.domain.repository.PacienteRepository;
import com.clinica.turnos.domain.repository.TurnoRepository;
import com.clinica.turnos.presentation.dto.turno.ReservarTurnoRequest;
import com.clinica.turnos.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservarTurnoUseCase")
class ReservarTurnoUseCaseTest {

    @Mock PacienteRepository pacienteRepository;
    @Mock MedicoRepository   medicoRepository;
    @Mock TurnoRepository    turnoRepository;

    @InjectMocks ReservarTurnoUseCase useCase;

    private Paciente paciente;
    private Medico   medico;
    private UUID     pacienteId;
    private UUID     medicoId;

    @BeforeEach
    void setUp() {
        paciente   = TestDataFactory.paciente();
        medico     = TestDataFactory.medico();
        pacienteId = UUID.randomUUID();
        medicoId   = UUID.randomUUID();
    }

    @Test
    @DisplayName("reserva exitosa cuando hay disponibilidad")
    void deberiaReservarCuandoHayDisponibilidad() {
        var request = request(LocalDateTime.now().plusDays(1));

        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.of(paciente));
        when(medicoRepository.buscarPorId(medicoId)).thenReturn(Optional.of(medico));
        when(turnoRepository.existeSolapamiento(any(), any(), any(), any())).thenReturn(false);
        when(turnoRepository.guardar(any())).thenAnswer(inv -> inv.getArgument(0));

        Turno resultado = useCase.ejecutar(request);

        assertThat(resultado.getPaciente()).isEqualTo(paciente);
        assertThat(resultado.getMedico()).isEqualTo(medico);
        verify(turnoRepository).guardar(any(Turno.class));
    }

    @Test
    @DisplayName("falla cuando el paciente no existe")
    void deberiaFallarSiPacienteNoExiste() {
        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.ejecutar(request(LocalDateTime.now().plusDays(1))))
            .isInstanceOf(RecursoNoEncontradoException.class)
            .hasMessageContaining("Paciente");

        verifyNoInteractions(turnoRepository);
    }

    @Test
    @DisplayName("falla cuando el médico no existe")
    void deberiaFallarSiMedicoNoExiste() {
        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.of(paciente));
        when(medicoRepository.buscarPorId(medicoId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.ejecutar(request(LocalDateTime.now().plusDays(1))))
            .isInstanceOf(RecursoNoEncontradoException.class)
            .hasMessageContaining("Médico");
    }

    @Test
    @DisplayName("falla cuando el paciente está inactivo")
    void deberiaFallarSiPacienteInactivo() {
        paciente.setActivo(false);
        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.of(paciente));
        when(medicoRepository.buscarPorId(medicoId)).thenReturn(Optional.of(medico));

        assertThatThrownBy(() -> useCase.ejecutar(request(LocalDateTime.now().plusDays(1))))
            .isInstanceOf(ReglaNegocioException.class)
            .hasMessageContaining("paciente no está activo");
    }

    @Test
    @DisplayName("falla cuando el médico está inactivo")
    void deberiaFallarSiMedicoInactivo() {
        medico.setActivo(false);
        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.of(paciente));
        when(medicoRepository.buscarPorId(medicoId)).thenReturn(Optional.of(medico));

        assertThatThrownBy(() -> useCase.ejecutar(request(LocalDateTime.now().plusDays(1))))
            .isInstanceOf(ReglaNegocioException.class)
            .hasMessageContaining("médico no está disponible");
    }

    @Test
    @DisplayName("falla cuando hay solapamiento de horarios")
    void deberiaFallarSiHaySolapamiento() {
        when(pacienteRepository.buscarPorId(pacienteId)).thenReturn(Optional.of(paciente));
        when(medicoRepository.buscarPorId(medicoId)).thenReturn(Optional.of(medico));
        when(turnoRepository.existeSolapamiento(any(), any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> useCase.ejecutar(request(LocalDateTime.now().plusDays(1))))
            .isInstanceOf(ReglaNegocioException.class)
            .hasMessageContaining("ya tiene un turno en ese horario");

        verify(turnoRepository, never()).guardar(any());
    }

    private ReservarTurnoRequest request(LocalDateTime fechaHora) {
        return new ReservarTurnoRequest(pacienteId, medicoId, fechaHora, 30, "Control");
    }
}
