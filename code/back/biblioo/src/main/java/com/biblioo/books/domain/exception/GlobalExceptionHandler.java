package com.biblioo.books.domain.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------------------------
    // 404 — Livro não encontrado
    // -------------------------------------------------------------------------

    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBookNotFound(
            BookNotFoundException ex, HttpServletRequest request) {

        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // -------------------------------------------------------------------------
    // 409 — Regra de negócio / conflito de estado (ex: nome duplicado)
    // -------------------------------------------------------------------------

    @ExceptionHandler(ShelfBusinessException.class)
    public ResponseEntity<ErrorResponse> handleShelfBusiness(
            ShelfBusinessException ex, HttpServletRequest request) {

        return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // -------------------------------------------------------------------------
    // 400 — Erro de validação (@Valid)
    // -------------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ValidationErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "Erro de validação",
                        request.getRequestURI(),
                        errors
                )
        );
    }

    // -------------------------------------------------------------------------
    // 400 — Body inválido / Enum inválido
    // -------------------------------------------------------------------------

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        String message = "Body da requisição inválido.";

        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife
                && ife.getTargetType() != null
                && ife.getTargetType().isEnum()) {

            String validValues = Arrays.stream(ife.getTargetType().getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));

            message = "Valor inválido '" + ife.getValue()
                    + "'. Valores aceitos: [" + validValues + "]";
        }

        return buildError(HttpStatus.BAD_REQUEST, message, request);
    }

    // -------------------------------------------------------------------------
    // 400 — Header ausente
    // -------------------------------------------------------------------------

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingHeader(
            MissingRequestHeaderException ex, HttpServletRequest request) {

        return buildError(HttpStatus.BAD_REQUEST,
                "Header obrigatório ausente: " + ex.getHeaderName(),
                request);
    }

    // -------------------------------------------------------------------------
    // 400 — Tipo inválido (path/query param)
    // -------------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String type = ex.getRequiredType() != null
                ? ex.getRequiredType().getSimpleName()
                : "tipo desconhecido";

        return buildError(HttpStatus.BAD_REQUEST,
                "Parâmetro inválido: '" + ex.getName() + "' deve ser do tipo " + type,
                request);
    }

    // -------------------------------------------------------------------------
    // 500 — Erro genérico
    // -------------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, HttpServletRequest request) {

        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro interno. Tente novamente mais tarde.",
                request);
    }

    // =========================================================================
    // Helper
    // =========================================================================

    private ResponseEntity<ErrorResponse> buildError(
            HttpStatus status, String message, HttpServletRequest request) {

        return ResponseEntity.status(status).body(
                new ErrorResponse(
                        LocalDateTime.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI()
                )
        );
    }

    // =========================================================================
    // DTOs de erro
    // =========================================================================

    public record ErrorResponse(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path
    ) {}

    public record ValidationErrorResponse(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path,
            List<FieldError> errors
    ) {}

    public record FieldError(
            String field,
            String message
    ) {}
}