package com.biblioo.recommendation.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookScore {

  private Long bookId;
  private double score;
  private String source;
}
