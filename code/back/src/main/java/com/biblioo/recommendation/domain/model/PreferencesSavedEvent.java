package com.biblioo.recommendation.domain.model;

import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class PreferencesSavedEvent {
  private final Long userId;
  private final List<String> genres;
  private final List<Long> bookIds;
}
