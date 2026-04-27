package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.FeedSlice;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.FeedUseCase;
import com.biblioo.feed.infrastructure.dto.feed.FeedItemResponse;
import com.biblioo.feed.infrastructure.dto.feed.FeedPageResponse;
import com.biblioo.feed.infrastructure.persistence.FeedPostRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

  @GetMapping
  @Operation(summary = "Retorna o feed do usuário com paginação por cursor")
  public ResponseEntity<FeedPageResponse> getFeed(
      @RequestParam Long userId,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int size) {

    FeedSlice slice = feedUseCase.getFeed(userId, cursor, Math.min(size, 50));

    // Separa IDs por tipo de conteúdo
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

    // Busca conteúdo em batch — filtra deletados em memória
    Map<Long, Review> reviewMap =
        reviewIds.isEmpty()
            ? Map.of()
            : reviewRepository.findAllById(reviewIds).stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .collect(Collectors.toMap(Review::getId, Function.identity()));

    Map<Long, FeedPost> postMap =
        postIds.isEmpty()
            ? Map.of()
            : feedPostRepository.findAllById(postIds).stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .collect(Collectors.toMap(FeedPost::getId, Function.identity()));

    List<FeedItemResponse> items = new ArrayList<>();
    for (FeedItem item : slice.items()) {
      if ("REVIEW".equals(item.getContentType())) {
        Review r = reviewMap.get(item.getContentId());
        if (r != null) items.add(FeedItemResponse.from(item, r));
      } else if ("POST".equals(item.getContentType())) {
        FeedPost p = postMap.get(item.getContentId());
        if (p != null) items.add(FeedItemResponse.from(item, p));
      }
    }

    return ResponseEntity.ok(new FeedPageResponse(items, slice.nextCursor(), slice.hasMore()));
  }

  @GetMapping("/new-count")
  @Operation(summary = "Retorna contagem de novos itens desde o último score visto")
  public ResponseEntity<Map<String, Long>> getNewItemsCount(
      @RequestParam Long userId, @RequestParam Long sinceScore) {
    long count = feedUseCase.getNewItemsCount(userId, sinceScore);
    return ResponseEntity.ok(Map.of("newItems", count));
  }
}
