package com.biblioo.books.infrasestructure.dto.book;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSearchResult {
  private Long id;
  private String title;
  private List<String> authors;
  private String coverUrl;
  private Integer pageCount;
  private Float averageRating;
  private String description;
  private Integer readerCount;
}
