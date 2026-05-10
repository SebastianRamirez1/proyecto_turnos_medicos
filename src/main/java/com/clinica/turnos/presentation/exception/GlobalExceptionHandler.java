package com.clinica.turnos.presentation.exception;

import com.clinica.turnos.domain.exception.RecursoNoEncontradoException;
import com.clinica.turnos.domain.exception.ReglaNegocioException;
import com.clinica.turnos.domain.exception.TransicionEstadoInvalidaException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiError> handleNotFound(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of(404, "RECURSO_NO_ENCONTRADO", ex.getMessage()));
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ApiError> handleReglaNegocio(ReglaNegocioException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of(409, "REGLA_NEGOCIO", ex.getMessage()));
    }

    @ExceptionHandler(TransicionEstadoInvalidaException.class)
    public ResponseEntity<ApiError> handleTransicion(TransicionEstadoInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiError.of(422, "TRANSICION_INVALIDA", ex.getMessage()));
    }

    // Errores de validación de Bean Validation (@NotBlank, @Email, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .sorted()
            .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiError.withErrores(400, "VALIDACION", "La solicitud contiene datos inválidos", errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError.of(500, "ERROR_INTERNO", "Ocurrió un error inesperado. Contacte al administrador."));
    }
}
