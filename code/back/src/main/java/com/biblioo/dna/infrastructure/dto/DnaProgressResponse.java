package com.biblioo.dna.infrastructure.dto;

public record DnaProgressResponse(int booksRead, int booksRequired, String message) {

  public static DnaProgressResponse of(int booksRead) {
    return new DnaProgressResponse(
        booksRead,
        5,
        "DNA em formação: leia mais " + (5 - booksRead) + " livro(s) para desbloquear seu DNA literário.");
  }
}
