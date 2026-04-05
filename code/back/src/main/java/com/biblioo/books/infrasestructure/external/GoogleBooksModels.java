package com.biblioo.books.infrasestructure.external;

import java.util.List;
import java.util.Map;

public class GoogleBooksModels {

  public record GoogleBooksResponse(int totalItems, List<VolumeItem> items) {}

  public record VolumeItem(String id, VolumeInfo volumeInfo) {}

  public record VolumeInfo(
      String title,
      List<String> authors,
      String publisher,
      String publishedDate,
      String description,
      List<IndustryIdentifier> industryIdentifiers,
      Integer pageCount,
      List<String> categories,
      Float averageRating,
      Integer ratingsCount,
      String language,
      Map<String, String> imageLinks) {}

  public record IndustryIdentifier(String type, String identifier) {}
}
