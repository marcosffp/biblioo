package com.biblioo.user.domain.port.out;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ProfileImagePort {

  CompletableFuture<String> uploadProfileImage(byte[] imageBytes, String userId);

  CompletableFuture<String> uploadBannerImage(byte[] imageBytes, String userId);

  void deleteImages(List<String> imageUrls);
}
