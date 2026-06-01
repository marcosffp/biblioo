package com.biblioo.user.domain.exception;

public class RegistrationConflictException extends RuntimeException {
  public RegistrationConflictException() {
    super("Não foi possível completar o cadastro. Verifique os dados informados.");
  }
}