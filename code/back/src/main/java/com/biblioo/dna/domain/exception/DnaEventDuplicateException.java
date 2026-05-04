package com.biblioo.dna.domain.exception;

public class DnaEventDuplicateException extends RuntimeException {
  public DnaEventDuplicateException(String eventId) {
    super("Evento duplicado: " + eventId);
  }
}
