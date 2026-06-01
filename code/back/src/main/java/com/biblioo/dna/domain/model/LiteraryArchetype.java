package com.biblioo.dna.domain.model;

public enum LiteraryArchetype {
  DISCOVERY_READER("Leitor em Descoberta"),
  GENRE_DEVOTEE("Devoto do Gênero"),
  CLASSICS_SCHOLAR("Erudito Clássico"),
  COMPULSIVE_READER("Leitor Compulsivo"),
  ECLECTIC_READER("Leitor Eclético"),
  RE_READER("Releitor"),
  EMOTIONAL_READER("Leitor Emocional"),
  EXPLORER("Explorador");

  private final String label;

  LiteraryArchetype(String label) {
    this.label = label;
  }

  public String getLabel() {
    return label;
  }
}
