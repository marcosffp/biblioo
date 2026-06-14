package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.exception.FeedPostBusinessException;
import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.domain.port.in.FeedPostUseCase;
import com.biblioo.feed.domain.service.LikeStatusResolver;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.comment.CommentResponse;
import com.biblioo.feed.infrastructure.dto.like.LikeResponse;
import com.biblioo.feed.infrastructure.dto.mapper.CommentMapper;
import com.biblioo.feed.infrastructure.dto.mapper.FeedPostMapper;
import com.biblioo.feed.infrastructure.dto.post.FeedPostBasicResponse;
import com.biblioo.feed.infrastructure.dto.post.FeedPostResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.apache.tika.Tika;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/feed/posts")
@Tag(name = "Posts", description = "Posts no feed — com vínculo opcional a um livro")
public class FeedPostController {

  private final FeedPostUseCase feedPostUseCase;
  private final FeedPostMapper feedPostMapper;
  private final CommentUseCase commentUseCase;
  private final CommentMapper commentMapper;
  private final CommentEnricher commentEnricher;
  private final LikeStatusResolver likeStatusResolver;

  public FeedPostController(
      FeedPostUseCase feedPostUseCase,
      FeedPostMapper feedPostMapper,
      CommentUseCase commentUseCase,
      CommentMapper commentMapper,
      CommentEnricher commentEnricher,
      LikeStatusResolver likeStatusResolver) {
    this.feedPostUseCase = feedPostUseCase;
    this.feedPostMapper = feedPostMapper;
    this.commentUseCase = commentUseCase;
    this.commentMapper = commentMapper;
    this.commentEnricher = commentEnricher;
    this.likeStatusResolver = likeStatusResolver;
  }

  // ── CRUD do Post ────────────────────────────────────────────────────────────

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Cria um post no feed",
      description =
          "Permite texto, até 5 imagens, 1 GIF, tags, marcação de spoiler e vínculo opcional com um livro.")
  public ResponseEntity<FeedPostResponse> createPost(
      @AuthenticationPrincipal UserDetails principal,
      @RequestParam(required = false) String text,
      @RequestParam(required = false) Long bookId,
      @RequestPart(required = false) List<MultipartFile> images,
      @RequestPart(required = false) MultipartFile gif,
      @RequestParam(required = false) List<String> tags,
      @RequestParam(defaultValue = "false") boolean hasSpoiler) {

    if (text != null && text.length() > 2000) {
      throw new FeedPostBusinessException("O texto não pode ultrapassar 2000 caracteres.");
    }

    Long userId = Long.parseLong(principal.getUsername());
    String safeText = sanitize(text);
    validateFiles(images, gif);

    FeedPost result =
        feedPostUseCase.createPost(
            userId, bookId, safeText, parseImages(images), parseGif(gif), tags, hasSpoiler);

    return ResponseEntity.status(HttpStatus.CREATED).body(feedPostMapper.toResponse(result));
  }

  @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Edita um post",
      description = "Atualiza texto, imagens, GIF, tags, spoiler e vínculo com livro.")
  public ResponseEntity<FeedPostResponse> updatePost(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long postId,
      @RequestParam(required = false) String text,
      @RequestParam(required = false) Long bookId,
      @RequestParam(required = false) List<String> imagesToDeleteUrls,
      @RequestPart(required = false) List<MultipartFile> images,
      @RequestPart(required = false) MultipartFile gif,
      @RequestParam(required = false) List<String> tags,
      @RequestParam(defaultValue = "false") boolean hasSpoiler) {

    if (text != null && text.length() > 2000) {
      throw new FeedPostBusinessException("O texto não pode ultrapassar 2000 caracteres.");
    }

    Long userId = Long.parseLong(principal.getUsername());
    String safeText = sanitize(text);
    validateFiles(images, gif);

    FeedPost result =
        feedPostUseCase.updatePost(
            userId,
            postId,
            bookId,
            safeText,
            parseImages(images),
            imagesToDeleteUrls,
            parseGif(gif),
            tags,
            hasSpoiler);

    return ResponseEntity.ok(feedPostMapper.toResponse(result));
  }

  @DeleteMapping("/{postId}")
  @Operation(summary = "Exclui um post")
  public ResponseEntity<Void> deletePost(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long postId) {
    Long userId = Long.parseLong(principal.getUsername());
    feedPostUseCase.deletePost(userId, postId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{postId}")
  @Operation(summary = "Retorna um post por ID")
  public ResponseEntity<FeedPostResponse> getPost(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long postId) {
    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    FeedPost post = feedPostUseCase.getPostById(postId);
    return ResponseEntity.ok(
        feedPostMapper
            .toResponse(post)
            .copyWithLikeStatus(likeStatusResolver.isLiked(viewerId, postId)));
  }

  @GetMapping("/{postId}/basic")
  @Operation(summary = "Retorna dados resumidos de um post")
  public ResponseEntity<FeedPostBasicResponse> getPostBasic(@PathVariable Long postId) {
    return ResponseEntity.ok(feedPostMapper.toBasicResponse(feedPostUseCase.getPostById(postId)));
  }

  @GetMapping("/user/{userId}")
  @Operation(summary = "Lista posts recentes de um usuário")
  public ResponseEntity<Page<FeedPostResponse>> getUserPosts(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long userId,
      @PageableDefault(size = 10) Pageable pageable) {
    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    Page<FeedPost> posts = feedPostUseCase.getRecentPostsByUserId(userId, pageable);
    List<Long> ids = posts.getContent().stream().map(FeedPost::getId).toList();
    Set<Long> likedIds = likeStatusResolver.resolve(viewerId, ids);
    return ResponseEntity.ok(
        posts.map(
            p -> feedPostMapper.toResponse(p).copyWithLikeStatus(likedIds.contains(p.getId()))));
  }

  @PostMapping("/{postId}/like")
  @Operation(summary = "Curtir / descurtir um post")
  public ResponseEntity<LikeResponse> likePost(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do post") @PathVariable Long postId) {
    Long userId = Long.parseLong(principal.getUsername());
    boolean liked = feedPostUseCase.likePost(userId, postId);
    return ResponseEntity.ok(new LikeResponse(liked));
  }

  // ── Comentários no Post ──────────────────────────────────────────────────────
  // Reutiliza CommentUseCase: FeedPost é um Commentable, portanto o parentId é o postId.

  @PostMapping(value = "/{postId}/comments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Comenta em um post")
  public ResponseEntity<CommentBasicResponse> createComment(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long postId,
      @RequestParam(required = false) String text,
      @RequestPart(required = false) List<MultipartFile> images,
      @RequestPart(required = false) MultipartFile gif) {

    Long userId = Long.parseLong(principal.getUsername());
    validateFiles(images, gif);
    Comment comment =
        commentUseCase.createComment(
            userId, postId, sanitize(text), parseImages(images), parseGif(gif));
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(commentEnricher.enrich(commentMapper.toBasicResponse(comment)));
  }

  @GetMapping("/{postId}/comments")
  @Operation(summary = "Lista comentários de um post")
  public ResponseEntity<Page<CommentBasicResponse>> getComments(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long postId,
      @PageableDefault(size = 20) Pageable pageable) {
    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    return ResponseEntity.ok(
        commentEnricher.enrich(
            commentUseCase.getComments(postId, pageable).map(commentMapper::toBasicResponse),
            viewerId));
  }

  @PutMapping(
      value = "/{postId}/comments/{commentId}",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Edita um comentário")
  public ResponseEntity<CommentResponse> updateComment(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long commentId,
      @RequestParam(required = false) String text,
      @RequestParam(required = false) List<String> imagesToDeleteUrls,
      @RequestPart(required = false) List<MultipartFile> images,
      @RequestPart(required = false) MultipartFile gif) {

    Long userId = Long.parseLong(principal.getUsername());
    validateFiles(images, gif);
    Comment updated =
        commentUseCase.updateComment(
            userId,
            commentId,
            sanitize(text),
            parseImages(images),
            imagesToDeleteUrls,
            parseGif(gif));
    return ResponseEntity.ok(commentMapper.toResponse(updated));
  }

  @DeleteMapping("/{postId}/comments/{commentId}")
  @Operation(summary = "Exclui um comentário")
  public ResponseEntity<Void> deleteComment(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long commentId) {
    Long userId = Long.parseLong(principal.getUsername());
    commentUseCase.deleteComment(userId, commentId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{postId}/comments/{commentId}")
  @Operation(summary = "Retorna um comentário por ID")
  public ResponseEntity<CommentResponse> getComment(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long commentId) {
    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    Comment comment = commentUseCase.getCommentById(commentId);
    return ResponseEntity.ok(
        commentMapper
            .toResponse(comment)
            .copyWithLikeStatus(likeStatusResolver.isLiked(viewerId, commentId)));
  }

  @PostMapping("/{postId}/comments/{commentId}/like")
  @Operation(summary = "Curtir / descurtir um comentário de post")
  public ResponseEntity<LikeResponse> likeComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário") @PathVariable Long commentId) {
    Long userId = Long.parseLong(principal.getUsername());
    boolean liked = commentUseCase.likeComment(userId, commentId);
    return ResponseEntity.ok(new LikeResponse(liked));
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private String sanitize(String html) {
    if (html == null) return null;
    return Jsoup.clean(html, Safelist.none());
  }

  private void validateFiles(List<MultipartFile> images, MultipartFile gif) {
    if (images != null) {
      if (images.size() > 5) throw new FeedPostBusinessException("Máximo 5 imagens permitidas.");
      images.forEach(this::validateImage);
    }
    if (gif != null) {
      if (gif.getSize() > 10 * 1024 * 1024)
        throw new FeedPostBusinessException("GIF excede o limite de 10 MB.");
      try {
        String type = new Tika().detect(gif.getInputStream());
        if (!"image/gif".equals(type))
          throw new FeedPostBusinessException("O arquivo deve ser image/gif.");
      } catch (IOException e) {
        throw new FeedPostBusinessException("Erro ao processar o GIF.");
      }
    }
  }

  private void validateImage(MultipartFile file) {
    if (file.getSize() > 5 * 1024 * 1024)
      throw new FeedPostBusinessException("Imagem excede o limite de 5 MB.");
    try {
      String type = new Tika().detect(file.getInputStream());
      if (!"image/jpeg".equals(type) && !"image/png".equals(type) && !"image/webp".equals(type))
        throw new FeedPostBusinessException("Imagem deve ser JPEG, PNG ou WebP.");
    } catch (IOException e) {
      throw new FeedPostBusinessException("Erro ao processar a imagem.");
    }
  }

  private List<byte[]> parseImages(List<MultipartFile> images) {
    if (images == null) return new ArrayList<>();
    return new ArrayList<>(
        images.stream()
            .map(
                f -> {
                  try {
                    return f.getBytes();
                  } catch (IOException e) {
                    throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler imagem.");
                  }
                })
            .toList());
  }

  private byte[] parseGif(MultipartFile gif) {
    if (gif == null) return null;
    try {
      return gif.getBytes();
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler GIF.");
    }
  }
}
