package com.biblioo.user.domain.exception;

public class GoogleAccountNeedsPasswordException extends RuntimeException {
  public GoogleAccountNeedsPasswordException() {
    super(
        "Já foi feito o cadastro com esse e-mail via Google. Por favor, faça o login por meio do Google.");
  }
}
