package com.biblioo.user.domain.exception;

public class EmailRegisteredWithPasswordException extends RuntimeException {
  public EmailRegisteredWithPasswordException() {
    super("Este e-mail já está cadastrado com e-mail e senha. Por favor, faça o login com suas credenciais.");
  }
}
