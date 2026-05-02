package com.biblioo.user.domain.exception;
public class GoogleAccountNeedsPasswordException extends RuntimeException {
  public GoogleAccountNeedsPasswordException() {
    super("Esta conta foi criada via Google. Use 'Entrar com Google' ou redefina sua senha pelo link 'Esqueci minha senha'.");
  }
}