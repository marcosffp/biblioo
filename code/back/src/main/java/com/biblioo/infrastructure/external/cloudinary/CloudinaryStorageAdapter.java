package com.biblioo.infrastructure.external.cloudinary;

import com.biblioo.feed.domain.port.out.FeedImagePort;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CloudinaryStorageAdapter implements ProfileImagePort, FeedImagePort {

  private final Cloudinary cloudinary;

  @Async("userTaskExecutor")
  @Override
  public CompletableFuture<String> uploadProfileImage(byte[] imageBytes, String userId) {
    return CompletableFuture.completedFuture(
        upload(imageBytes, "biblioo/users/" + userId + "/avatar"));
  }

  @Async("userTaskExecutor")
  @Override
  public CompletableFuture<String> uploadBannerImage(byte[] imageBytes, String userId) {
    return CompletableFuture.completedFuture(
        upload(imageBytes, "biblioo/users/" + userId + "/banner"));
  }

  @Async("userTaskExecutor")
  @Override
  public CompletableFuture<String> uploadImage(byte[] imageBytes, String entityId, String imageId) {
    return CompletableFuture.completedFuture(
        upload(imageBytes, "biblioo/feed/" + entityId + "/" + imageId));
  }

  @Override
  public void deleteImages(List<String> imageUrls) {
    if (imageUrls != null) {
      for (String url : imageUrls) {
        try {
          String publicId = extractPublicId(url);
          if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
          }
        } catch (Exception e) {
        }
      }
    }
  }

  private String extractPublicId(String url) {
    try {
      int uploadIndex = url.indexOf("/upload/");
      if (uploadIndex == -1) return null;

      String path = url.substring(uploadIndex + 8);
      int versionSlashIndex = path.indexOf('/');

      if (path.startsWith("v") && versionSlashIndex != -1) {
        String possibleVersion = path.substring(1, versionSlashIndex);
        if (possibleVersion.matches("\\d+")) {
          path = path.substring(versionSlashIndex + 1);
        }
      }

      int lastDotIndex = path.lastIndexOf('.');
      if (lastDotIndex != -1) {
        path = path.substring(0, lastDotIndex);
      }
      return path;
    } catch (Exception e) {
      return null;
    }
  }

  private String upload(byte[] bytes, String publicId) {
    try {
      Map<?, ?> result =
          cloudinary.uploader().upload(bytes, ObjectUtils.asMap("public_id", publicId));
      return result.get("secure_url").toString();
    } catch (IOException e) {
      throw new RuntimeException("Erro ao enviar imagem para o Cloudinary", e);
    }
  }
}
