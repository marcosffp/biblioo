package com.biblioo.infrastructure.web;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.dna.domain.exception.DnaInFormationException;
import com.biblioo.feed.domain.exception.FeedPostBusinessException;
import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.EmailAlreadyExistsException;
import com.biblioo.user.domain.exception.EmailRegisteredWithPasswordException;
import com.biblioo.user.domain.exception.FollowRequestAlreadySentException;
import com.biblioo.user.domain.exception.GoogleAccountNeedsPasswordException;
import com.biblioo.user.domain.exception.GoogleAuthException;
import com.biblioo.user.domain.exception.InvalidCredentialsException;
import com.biblioo.user.domain.exception.InvalidPasswordResetTokenException;
import com.biblioo.user.domain.exception.InvalidTokenException;
import com.biblioo.user.domain.exception.PasswordAlreadyExistsException;
import com.biblioo.user.domain.exception.PasswordResetRateLimitException;
import com.biblioo.user.domain.exception.RegistrationConflictException;
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

  @ExceptionHandler(com.biblioo.assistant.domain.exception.AssistantRateLimitException.class)
  ResponseEntity<ErrorResponse> handleAssistantRateLimit(
      com.biblioo.assistant.domain.exception.AssistantRateLimitException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.assistant.domain.exception.AssistantException.class)
  ResponseEntity<ErrorResponse> handleAssistant(
      com.biblioo.assistant.domain.exception.AssistantException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_GATEWAY, ex.getMessage(), request);
  }

  @ExceptionHandler(DnaInFormationException.class)
  ResponseEntity<ErrorResponse> handleDnaInFormation(
      DnaInFormationException ex, HttpServletRequest request) {
    return buildError(HttpStatus.valueOf(422), ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.CommunityBusinessException.class)
  ResponseEntity<ErrorResponse> handleCommunityBusiness(
      com.biblioo.community.domain.exception.CommunityBusinessException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.CommunityAccessDeniedException.class)
  ResponseEntity<ErrorResponse> handleCommunityAccessDenied(
      com.biblioo.community.domain.exception.CommunityAccessDeniedException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.FORBIDDEN, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.VotingNotFoundException.class)
  ResponseEntity<ErrorResponse> handleVotingNotFound(
      com.biblioo.community.domain.exception.VotingNotFoundException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.VotingOptionNotFoundException.class)
  ResponseEntity<ErrorResponse> handleVotingOptionNotFound(
      com.biblioo.community.domain.exception.VotingOptionNotFoundException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.VotingClosedException.class)
  ResponseEntity<ErrorResponse> handleVotingClosed(
      com.biblioo.community.domain.exception.VotingClosedException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.VotingNotActiveException.class)
  ResponseEntity<ErrorResponse> handleVotingNotActive(
      com.biblioo.community.domain.exception.VotingNotActiveException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.VotingAlreadyActiveException.class)
  ResponseEntity<ErrorResponse> handleVotingAlreadyActive(
      com.biblioo.community.domain.exception.VotingAlreadyActiveException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.community.domain.exception.AlreadyVotedDifferentOptionException.class)
  ResponseEntity<ErrorResponse> handleAlreadyVotedDifferentOption(
      com.biblioo.community.domain.exception.AlreadyVotedDifferentOptionException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.feed.domain.exception.ReviewBusinessException.class)
  ResponseEntity<ErrorResponse> handleReviewBusiness(
      com.biblioo.feed.domain.exception.ReviewBusinessException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(com.biblioo.feed.domain.exception.CommentBusinessException.class)
  ResponseEntity<ErrorResponse> handleCommentBusiness(
      com.biblioo.feed.domain.exception.CommentBusinessException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

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

  @ExceptionHandler(RegistrationConflictException.class)
  ResponseEntity<ErrorResponse> handleRegistrationConflict(
      RegistrationConflictException ex, HttpServletRequest request) {
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

  @ExceptionHandler(org.springframework.dao.PessimisticLockingFailureException.class)
  ResponseEntity<ErrorResponse> handlePessimisticLock(
      org.springframework.dao.PessimisticLockingFailureException ex,
      HttpServletRequest request) {
    // Lock conflict on refresh_tokens row — treat as invalid token so the
    // client clears its session instead of retrying indefinitely.
    return buildError(
        HttpStatus.UNAUTHORIZED, "Token de atualização inválido ou expirado", request);
  }

  @ExceptionHandler(GoogleAuthException.class)
  ResponseEntity<ErrorResponse> handleGoogleAuth(
      GoogleAuthException ex, HttpServletRequest request) {
    return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
  }

  @ExceptionHandler(PasswordResetRateLimitException.class)
  ResponseEntity<ErrorResponse> handlePasswordResetRateLimit(
      PasswordResetRateLimitException ex, HttpServletRequest request) {
    return buildError(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request);
  }

  @ExceptionHandler(InvalidPasswordResetTokenException.class)
  ResponseEntity<ErrorResponse> handleInvalidPasswordResetToken(
      InvalidPasswordResetTokenException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(PasswordAlreadyExistsException.class)
  ResponseEntity<ErrorResponse> handlePasswordAlreadyExists(
      PasswordAlreadyExistsException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(AlreadyFollowingException.class)
  ResponseEntity<ErrorResponse> handleAlreadyFollowing(
      AlreadyFollowingException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

  @ExceptionHandler(FollowRequestAlreadySentException.class)
  ResponseEntity<ErrorResponse> handleFollowRequestAlreadySent(
      FollowRequestAlreadySentException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

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

  @ExceptionHandler(com.biblioo.recommendation.domain.exception.InvalidPreferenceException.class)
  ResponseEntity<ErrorResponse> handleInvalidPreference(
      com.biblioo.recommendation.domain.exception.InvalidPreferenceException ex,
      HttpServletRequest request) {
    return buildError(HttpStatus.valueOf(422), ex.getMessage(), request);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ErrorResponse> handleIllegalArgument(
      IllegalArgumentException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  ResponseEntity<ErrorResponse> handleMaxUploadSize(
      MaxUploadSizeExceededException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, "Arquivo excede o tamanho máximo permitido", request);
  }

  @ExceptionHandler(com.biblioo.share.domain.exception.GoodreadsImportException.class)
  ResponseEntity<ErrorResponse> handleGoodreadsImport(
      com.biblioo.share.domain.exception.GoodreadsImportException ex, HttpServletRequest request) {
    return buildError(HttpStatus.valueOf(422), ex.getMessage(), request);
  }

  @ExceptionHandler(org.springframework.dao.InvalidDataAccessApiUsageException.class)
  ResponseEntity<ErrorResponse> handleInvalidDataAccess(
      org.springframework.dao.InvalidDataAccessApiUsageException ex, HttpServletRequest request) {
    return buildError(
        HttpStatus.BAD_REQUEST, "Parâmetros de busca ou ordenação inválidos.", request);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno. Tente novamente.", request);
  }

  @ExceptionHandler(FeedPostBusinessException.class)
  ResponseEntity<ErrorResponse> handleBusiness(
      FeedPostBusinessException ex, HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
  }

  @ExceptionHandler(GoogleAccountNeedsPasswordException.class)
  ResponseEntity<ErrorResponse> handleGoogleAccountNeedsPassword(
      GoogleAccountNeedsPasswordException ex, HttpServletRequest request) {
    return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
  }

  @ExceptionHandler(EmailRegisteredWithPasswordException.class)
  ResponseEntity<ErrorResponse> handleEmailRegisteredWithPassword(
      EmailRegisteredWithPasswordException ex, HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
  }

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
