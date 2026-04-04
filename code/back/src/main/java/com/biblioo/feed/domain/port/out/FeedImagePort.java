package com.biblioo.feed.domain.port.out;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface FeedImagePort {
  CompletableFuture<String> uploadImage(byte[] imageBytes, String entityId, String imageId);

  void deleteImages(List<String> imageUrls);
}
