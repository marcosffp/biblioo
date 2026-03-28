package com.biblioo.infrastructure.web;

import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.EmailAlreadyExistsException;
import com.biblioo.user.domain.exception.InvalidCredentialsException;
import com.biblioo.user.domain.exception.InvalidTokenException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.exception.UsernameAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(UserNotFoundException.class)
  ResponseEntity<ProblemDetail> handleUserNotFound(UserNotFoundException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    pd.setTitle("User Not Found");
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(pd);
  }

  @ExceptionHandler(EmailAlreadyExistsException.class)
  ResponseEntity<ProblemDetail> handleEmailExists(EmailAlreadyExistsException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    pd.setTitle("Email Already In Use");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
  }

  @ExceptionHandler(UsernameAlreadyExistsException.class)
  ResponseEntity<ProblemDetail> handleUsernameExists(UsernameAlreadyExistsException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    pd.setTitle("Username Already In Use");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  ResponseEntity<ProblemDetail> handleInvalidCredentials(InvalidCredentialsException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    pd.setTitle("Invalid Credentials");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(pd);
  }

  @ExceptionHandler(InvalidTokenException.class)
  ResponseEntity<ProblemDetail> handleInvalidToken(InvalidTokenException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    pd.setTitle("Invalid Token");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(pd);
  }

  @ExceptionHandler(AlreadyFollowingException.class)
  ResponseEntity<ProblemDetail> handleAlreadyFollowing(AlreadyFollowingException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    pd.setTitle("Already Following");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    pd.setTitle("Bad Request");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(pd);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
    String detail =
        ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("Validation failed");
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    pd.setTitle("Validation Error");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(pd);
  }
}
