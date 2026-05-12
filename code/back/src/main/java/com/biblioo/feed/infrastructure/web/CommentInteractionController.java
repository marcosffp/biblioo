package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.like.LikeResponse;
import com.biblioo.feed.infrastructure.dto.mapper.CommentMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed/comments")
@Tag(name = "Comment Interactions", description = "Curtidas e respostas em comentários")
public class CommentInteractionController {

  private final CommentUseCase commentUseCase;
  private final CommentMapper commentMapper;
  private final CommentEnricher commentEnricher;

  public CommentInteractionController(
      CommentUseCase commentUseCase,
      CommentMapper commentMapper,
      CommentEnricher commentEnricher) {
    this.commentUseCase = commentUseCase;
    this.commentMapper = commentMapper;
    this.commentEnricher = commentEnricher;
  }

  @PostMapping("/{commentId}/like")
  @Operation(summary = "Curtir / descurtir um comentário")
  public ResponseEntity<LikeResponse> likeComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário") @PathVariable Long commentId) {
    Long userId = Long.parseLong(principal.getUsername());
    boolean liked = commentUseCase.likeComment(userId, commentId);
    return ResponseEntity.ok(new LikeResponse(liked));
  }

  @GetMapping("/{commentId}/replies")
  @Operation(summary = "Lista respostas de um comentário")
  public ResponseEntity<Page<CommentBasicResponse>> getReplies(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário pai") @PathVariable Long commentId,
      @PageableDefault(size = 10) Pageable pageable) {
    Long userId = Long.parseLong(principal.getUsername());
    return ResponseEntity.ok(
        commentEnricher.enrich(
            commentUseCase.getComments(commentId, pageable).map(commentMapper::toBasicResponse),
            userId));
  }

  @DeleteMapping("/{commentId}")
  @Operation(summary = "Exclui um comentário ou resposta")
  public ResponseEntity<Void> deleteComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário") @PathVariable Long commentId) {
    Long userId = Long.parseLong(principal.getUsername());
    commentUseCase.deleteComment(userId, commentId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{commentId}/replies")
  @Operation(summary = "Responder a um comentário")
  public ResponseEntity<CommentBasicResponse> createReply(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário pai") @PathVariable Long commentId,
      @Parameter(description = "Texto da resposta") @RequestParam String text) {
    Long userId = Long.parseLong(principal.getUsername());
    Comment reply = commentUseCase.createReply(userId, commentId, Jsoup.clean(text, Safelist.none()));
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(commentEnricher.enrich(commentMapper.toBasicResponse(reply)));
  }
}
