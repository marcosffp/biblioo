package com.biblioo.community.domain.exception;

public class VotingOptionNotFoundException extends RuntimeException {
  public VotingOptionNotFoundException(Long optionId) {
    super("Opção de votação não encontrada: " + optionId);
  }
}
