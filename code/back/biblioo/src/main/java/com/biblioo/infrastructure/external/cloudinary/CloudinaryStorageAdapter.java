package com.biblioo.infrastructure.external.cloudinary;

import com.biblioo.books.domain.port.out.BookCoverPort;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CloudinaryStorageAdapter implements ProfileImagePort, BookCoverPort {

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

  @Override
  public String uploadBookCover(byte[] imageBytes, String isbn) {
    return upload(imageBytes, "biblioo/books/" + isbn);
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
