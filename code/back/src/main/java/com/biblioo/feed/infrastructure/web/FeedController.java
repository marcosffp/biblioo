package com.biblioo.feed.infrastructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.FeedUseCase;
import com.biblioo.feed.domain.port.out.BookPort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.domain.service.LikeStatusResolver;
import com.biblioo.feed.infrastructure.dto.feed.FeedItemResponse;
import com.biblioo.feed.infrastructure.dto.feed.FeedPageResponse;
import com.biblioo.feed.infrastructure.dto.feed.FeedSlice;
import com.biblioo.feed.infrastructure.persistence.FeedPostRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import com.biblioo.user.domain.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
@Tag(name = "Feed", description = "Feed personalizado do usuário")
public class FeedController {

  private final FeedUseCase feedUseCase;
  private final ReviewRepository reviewRepository;
  private final FeedPostRepository feedPostRepository;
  private final UserPort userPort;
  private final BookPort bookPort;
  private final LikeStatusResolver likeStatusResolver;

  @GetMapping
  @Operation(summary = "Retorna o feed do usuário com paginação por cursor")
  public ResponseEntity<FeedPageResponse> getFeed(
      @AuthenticationPrincipal UserDetails principal,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int size) {

    Long viewerId = extractUserId(principal);
    FeedSlice slice = feedUseCase.getFeed(viewerId, cursor, Math.min(size, 50));

    Set<Long> reviewIds =
        slice.items().stream()
            .filter(i -> "REVIEW".equals(i.getContentType()))
            .map(FeedItem::getContentId)
            .collect(Collectors.toSet());

    Set<Long> postIds =
        slice.items().stream()
            .filter(i -> "POST".equals(i.getContentType()))
            .map(FeedItem::getContentId)
            .collect(Collectors.toSet());

    Map<Long, Review> reviewMap =
        reviewIds.isEmpty()
            ? Map.of()
            : reviewRepository.findAllById(reviewIds).stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .filter(r -> Boolean.TRUE.equals(r.getIsPublished()))
                .collect(Collectors.toMap(Review::getId, Function.identity()));

    Map<Long, FeedPost> postMap =
        postIds.isEmpty()
            ? Map.of()
            : feedPostRepository.findAllById(postIds).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .collect(Collectors.toMap(FeedPost::getId, Function.identity()));

    // Batch: busca dados de autor para todos os itens do feed em uma única query
    List<Long> authorIds =
        slice.items().stream().map(FeedItem::getAuthorId).distinct().collect(Collectors.toList());
    Map<Long, User> userMap =
        authorIds.isEmpty()
            ? Map.of()
            : userPort.getUsersByIds(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

    // Batch: busca dados de livro para todas as reviews em uma única query
    List<Long> bookIds =
        reviewMap.values().stream()
            .map(Review::getBookId)
            .filter(id -> id != null)
            .distinct()
            .collect(Collectors.toList());
    Map<Long, Book> bookMap =
        bookIds.isEmpty()
            ? Map.of()
            : bookPort.getBooksByIds(bookIds).stream()
                .collect(Collectors.toMap(Book::getId, Function.identity()));

    // Batch: verifica curtidas do usuário sobre todos os conteúdos da página em uma única query
    Set<Long> allContentIds = new HashSet<>(reviewIds);
    allContentIds.addAll(postIds);
    Set<Long> likedIds = likeStatusResolver.resolve(viewerId, allContentIds);

    List<FeedItemResponse> items = new ArrayList<>();
    for (FeedItem item : slice.items()) {
      User author = userMap.get(item.getAuthorId());
      String authorUsername = author != null ? author.getUsername() : null;
      String authorAvatarUrl = author != null ? author.getAvatarUrl() : null;

      if ("REVIEW".equals(item.getContentType())) {
        Review r = reviewMap.get(item.getContentId());
        if (r == null) continue;
        Book book = r.getBookId() != null ? bookMap.get(r.getBookId()) : null;
        items.add(
            FeedItemResponse.from(
                item,
                r,
                authorUsername,
                authorAvatarUrl,
                book != null ? book.getTitle() : null,
                book != null ? book.getCoverUrl() : null,
                book != null ? book.getAuthors() : null,
                likedIds.contains(r.getId())));
      } else if ("POST".equals(item.getContentType())) {
        FeedPost p = postMap.get(item.getContentId());
        if (p == null) continue;
        items.add(
            FeedItemResponse.from(
                item, p, authorUsername, authorAvatarUrl, likedIds.contains(p.getId())));
      }
    }

    return ResponseEntity.ok(new FeedPageResponse(items, slice.nextCursor(), slice.hasMore()));
  }

  @GetMapping("/new-count")
  @Operation(summary = "Retorna contagem de novos itens desde o último score visto")
  public ResponseEntity<Map<String, Long>> getNewItemsCount(
      @AuthenticationPrincipal UserDetails principal, @RequestParam Long sinceScore) {
    long count = feedUseCase.getNewItemsCount(extractUserId(principal), sinceScore);
    return ResponseEntity.ok(Map.of("newItems", count));
  }

  private Long extractUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
