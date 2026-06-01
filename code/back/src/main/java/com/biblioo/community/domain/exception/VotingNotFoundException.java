package com.biblioo.community.domain.exception;

public class VotingNotFoundException extends RuntimeException {
  public VotingNotFoundException(Long votingId) {
    super("Votação não encontrada: " + votingId);
  }
}
