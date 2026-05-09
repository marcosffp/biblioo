package com.biblioo.assistant.domain.model;

import java.util.List;

public record UserDnaProfile(
    String status,
    int booksRead,
    String dominantArchetype,
    List<String> secondaryArchetypes,
    List<String> centralThemes,
    String complexityLabel,
    String mostAbandonedGenre) {}
