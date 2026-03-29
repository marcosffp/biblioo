package com.biblioo.books.domain.port.out;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ReviewImagePort {
  CompletableFuture<String> uploadReviewImage(byte[] imageBytes, String reviewId, String imageId);

  CompletableFuture<Void> deleteReviewImages(List<String> imageUrls);
}
