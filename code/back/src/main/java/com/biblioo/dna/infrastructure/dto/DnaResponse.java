package com.biblioo.dna.infrastructure.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record DnaResponse(
    Long userId,
    String status,
    Integer booksReadCount,
    Double complexityScore,
    String complexityLabel,
    Double avgDaysPerBook,
    Double rereadRate,
    Integer rereadCount,
    Integer abandonedCount,
    List<ThemeEntryDto> centralThemes,
    String dominantArchetype,
    String dominantArchetypeLabel,
    List<String> secondaryArchetypes,
    String mostAbandonedGenre,
    Double avgTimePerBookDays,
    Integer totalPagesRead,
    Map<Integer, Integer> pagesByYear,
    LocalDateTime calculatedAt) {}
