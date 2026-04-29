package com.biblioo.feed.infrastructure.dto.feed;

import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.Review;
import java.time.LocalDateTime;
import java.util.List;

public record FeedItemResponse(
    Long contentId,
    String contentType,
    Long authorId,
    String authorUsername,
    String authorAvatarUrl,
    long score,
    LocalDateTime createdAt,
    EmbeddedContentResponse content) {

  /**
   * Resposta unificada de conteúdo. Os campos bookId, rating, bookTitle, bookCoverUrl e bookAuthors
   * são preenchidos apenas para REVIEW; null para POST.
   */
  public record EmbeddedContentResponse(
      Long id,
      Long userId,
      String text,
      List<String> images,
      String gifUrl,
      List<String> tags,
      Boolean hasSpoiler,
      Integer likeCount,
      Integer commentCount,
      LocalDateTime createdAt,
      // Exclusivo de Review:
      Long bookId,
      Integer rating,
      String bookTitle,
      String bookCoverUrl,
      List<String> bookAuthors) {}

  public static FeedItemResponse from(
      FeedItem item,
      Review review,
      String authorUsername,
      String authorAvatarUrl,
      String bookTitle,
      String bookCoverUrl,
      List<String> bookAuthors) {
    var embedded =
        new EmbeddedContentResponse(
            review.getId(),
            review.getUserId(),
            review.getText(),
            review.getImages(),
            review.getGifUrl(),
            review.getTags(),
            review.getHasSpoiler(),
            review.getLikeCount(),
            review.getCommentCount(),
            review.getCreatedAt(),
            review.getBookId(),
            review.getRating(),
            bookTitle,
            bookCoverUrl,
            bookAuthors);
    return new FeedItemResponse(
        item.getContentId(),
        item.getContentType(),
        item.getAuthorId(),
        authorUsername,
        authorAvatarUrl,
        item.getScore(),
        item.getCreatedAt(),
        embedded);
  }

  public static FeedItemResponse from(
      FeedItem item, FeedPost post, String authorUsername, String authorAvatarUrl) {
    var embedded =
        new EmbeddedContentResponse(
            post.getId(),
            post.getUserId(),
            post.getText(),
            post.getImages(),
            post.getGifUrl(),
            post.getTags(),
            post.getHasSpoiler(),
            post.getLikeCount(),
            post.getCommentCount(),
            post.getCreatedAt(),
            null,
            null,
            null,
            null,
            null);
    return new FeedItemResponse(
        item.getContentId(),
        item.getContentType(),
        item.getAuthorId(),
        authorUsername,
        authorAvatarUrl,
        item.getScore(),
        item.getCreatedAt(),
        embedded);
  }
}
