package com.biblioo.dna.domain.exception;

public class DnaInFormationException extends RuntimeException {
  public DnaInFormationException(int currentBooks, int requiredBooks) {
    super(
        "DNA em formação: "
            + currentBooks
            + "/"
            + requiredBooks
            + " livros lidos necessários para calcular o DNA literário.");
  }
}
