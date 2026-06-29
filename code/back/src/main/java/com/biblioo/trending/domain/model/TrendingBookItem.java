package com.biblioo.trending.domain.model;

import java.util.ArrayList;
import java.util.List;

public record TrendingBookItem(
    Long bookId,
    String title,
    String coverUrl,
    String author,
    Long newReviews,
    Long shelfAdditions,
    Long progressUpdates,
    Long reviewLikes,
    Double score) {

  public String reason() {
    List<String> parts = new ArrayList<>();
    if (newReviews != null && newReviews > 0)
      parts.add(newReviews + (newReviews == 1 ? " avaliação nova" : " avaliações novas"));
    if (shelfAdditions != null && shelfAdditions > 0)
      parts.add(shelfAdditions + " adicionaram à estante");
    if (reviewLikes != null && reviewLikes > 0)
      parts.add(reviewLikes + (reviewLikes == 1 ? " curtida" : " curtidas") + " em avaliações");
    return parts.isEmpty() ? "Em tendência" : String.join(" • ", parts) + " nas últimas 48h";
  }
}
