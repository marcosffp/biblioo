package com.biblioo.infrastructure.web;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.EmailAlreadyExistsException;
import com.biblioo.user.domain.exception.InvalidCredentialsException;
import com.biblioo.user.domain.exception.InvalidTokenException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.exception.UsernameAlreadyExistsException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
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
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // ── Feed / Reviews ────────────────────────────────────────────────────────
  @ExceptionHandler(com.biblioo.feed.domain.exception.ReviewBusinessException.class)
  ResponseEntity<ErrorResponse> handleReviewBusiness(
      com.biblioo.feed.domain.exception.ReviewBusinessException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  // ── User ──────────────────────────────────────────────────────────────────

  @ExceptionHandler(UserNotFoundException.class)
  ResponseEntity<ErrorResponse> handleUserNotFound(
      UserNotFoundException ex, HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
  }

  @ExceptionHandler(EmailAlreadyExistsException.class)
  ResponseEntity<ErrorResponse> handleEmailExists(
      EmailAlreadyExistsException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(UsernameAlreadyExistsException.class)
  ResponseEntity<ErrorResponse> handleUsernameExists(
      UsernameAlreadyExistsException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  ResponseEntity<ErrorResponse> handleInvalidCredentials(
      InvalidCredentialsException ex, HttpServletRequest request) {
    return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
  }

  @ExceptionHandler(InvalidTokenException.class)
  ResponseEntity<ErrorResponse> handleInvalidToken(
      InvalidTokenException ex, HttpServletRequest request) {
    return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
  }

  @ExceptionHandler(AlreadyFollowingException.class)
  ResponseEntity<ErrorResponse> handleAlreadyFollowing(
      AlreadyFollowingException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  // ── Books ─────────────────────────────────────────────────────────────────

  @ExceptionHandler(BookNotFoundException.class)
  ResponseEntity<ErrorResponse> handleBookNotFound(
      BookNotFoundException ex, HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
  }

  @ExceptionHandler(ShelfBusinessException.class)
  ResponseEntity<ErrorResponse> handleShelfBusiness(
      ShelfBusinessException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  // ── Validação / Input ─────────────────────────────────────────────────────

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ValidationErrorResponse> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<FieldError> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new FieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(
            new ValidationErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Erro de validação",
                request.getRequestURI(),
                errors));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ErrorResponse> handleNotReadable(
      HttpMessageNotReadableException ex, HttpServletRequest request) {
    String message = "Body da requisição inválido.";
    Throwable cause = ex.getCause();
    if (cause instanceof InvalidFormatException ife
        && ife.getTargetType() != null
        && ife.getTargetType().isEnum()) {
      String validValues =
          Arrays.stream(ife.getTargetType().getEnumConstants())
              .map(Object::toString)
              .collect(Collectors.joining(", "));
      message = "Valor inválido '" + ife.getValue() + "'. Valores aceitos: [" + validValues + "]";
    }
    return buildError(HttpStatus.BAD_REQUEST, message, request);
  }

  @ExceptionHandler(MissingRequestHeaderException.class)
  ResponseEntity<ErrorResponse> handleMissingHeader(
      MissingRequestHeaderException ex, HttpServletRequest request) {
    return buildError(
        HttpStatus.BAD_REQUEST, "Header obrigatório ausente: " + ex.getHeaderName(), request);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  ResponseEntity<ErrorResponse> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
    String type =
        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "tipo desconhecido";
    return buildError(
        HttpStatus.BAD_REQUEST,
        "Parâmetro inválido: '" + ex.getName() + "' deve ser do tipo " + type,
        request);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ErrorResponse> handleIllegalArgument(
      IllegalArgumentException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  ResponseEntity<ErrorResponse> handleMaxUploadSize(
      MaxUploadSizeExceededException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, "Arquivo excede o tamanho máximo de 5MB", request);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno. Tente novamente.", request);
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private ResponseEntity<ErrorResponse> buildError(
      HttpStatus status, String message, HttpServletRequest request) {
    return ResponseEntity.status(status)
        .body(
            new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()));
  }

  // ── Response DTOs ─────────────────────────────────────────────────────────

  public record ErrorResponse(
      LocalDateTime timestamp, int status, String error, String message, String path) {}

  public record ValidationErrorResponse(
      LocalDateTime timestamp,
      int status,
      String error,
      String message,
      String path,
      List<FieldError> errors) {}

  public record FieldError(String field, String message) {}
}
