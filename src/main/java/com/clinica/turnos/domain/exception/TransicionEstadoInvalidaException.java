package com.clinica.turnos.domain.exception;

import com.clinica.turnos.domain.model.EstadoTurno;

public class TransicionEstadoInvalidaException extends RuntimeException {

    public TransicionEstadoInvalidaException(EstadoTurno desde, EstadoTurno hacia) {
        super("No se puede cambiar el estado de %s a %s".formatted(desde, hacia));
    }
}
