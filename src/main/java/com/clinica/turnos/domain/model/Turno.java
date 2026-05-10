package com.clinica.turnos.domain.model;

import com.clinica.turnos.domain.exception.TransicionEstadoInvalidaException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "turnos",
    uniqueConstraints = {
        // Un médico no puede tener dos turnos en la misma fecha/hora
        @UniqueConstraint(name = "uk_medico_fecha_hora", columnNames = {"medico_id", "fecha_hora"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private int duracionMinutos = 30;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTurno estado = EstadoTurno.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    private LocalDateTime fechaHoraFin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    private void calcularFechaHoraFin() {
        this.fechaHoraFin = fechaHora.plusMinutes(duracionMinutos);
    }

    // — Máquina de estados — solo las transiciones válidas están permitidas

    public void confirmar() {
        if (estado != EstadoTurno.PENDIENTE) {
            throw new TransicionEstadoInvalidaException(estado, EstadoTurno.CONFIRMADO);
        }
        this.estado = EstadoTurno.CONFIRMADO;
    }

    public void completar() {
        if (estado != EstadoTurno.CONFIRMADO) {
            throw new TransicionEstadoInvalidaException(estado, EstadoTurno.COMPLETADO);
        }
        this.estado = EstadoTurno.COMPLETADO;
    }

    public void cancelar() {
        if (estado == EstadoTurno.COMPLETADO || estado == EstadoTurno.CANCELADO) {
            throw new TransicionEstadoInvalidaException(estado, EstadoTurno.CANCELADO);
        }
        this.estado = EstadoTurno.CANCELADO;
    }

    public void marcarAusente() {
        if (estado != EstadoTurno.CONFIRMADO) {
            throw new TransicionEstadoInvalidaException(estado, EstadoTurno.AUSENTE);
        }
        this.estado = EstadoTurno.AUSENTE;
    }

    public LocalDateTime getFechaHoraFin() {
        return fechaHoraFin != null ? fechaHoraFin : fechaHora.plusMinutes(duracionMinutos);
    }

}
