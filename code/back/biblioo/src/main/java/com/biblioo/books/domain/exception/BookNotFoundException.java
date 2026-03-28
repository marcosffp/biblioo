package com.biblioo.books.domain.exception;

public class BookNotFoundException extends RuntimeException {
  public BookNotFoundException(Long id) {
    super("Livro não encontrado id:  " + id);
  }
}
