package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.exception.CommentBusinessException;
import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.comment.CommentResponse;
import com.biblioo.feed.infrastructure.dto.mapper.CommentMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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
@RequestMapping("/feed/reviews/{reviewId}/comments")
@Tag(name = "Comments", description = "Gerenciamento de comentários em avaliações de livros")
public class CommentController {

  private final CommentUseCase commentUseCase;
  private final CommentMapper commentMapper;

  public CommentController(CommentUseCase commentUseCase, CommentMapper commentMapper) {
    this.commentUseCase = commentUseCase;
    this.commentMapper = commentMapper;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Cria um comentário em uma avaliação",
      description =
          "Cria um novo comentário na avaliação indicada. Permite texto (opcional),"
              + " até 5 imagens e 1 GIF.")
  public ResponseEntity<CommentResponse> createComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId,
      @Parameter(description = "Texto do comentário (até 2000 caracteres)", example = "Ótima review!")
          @RequestParam(required = false)
          String text,
      @Parameter(description = "Imagens a anexar ao comentário (máx 5)")
          @RequestPart(required = false)
          List<MultipartFile> images,
      @Parameter(description = "GIF animado a anexar ao comentário")
          @RequestPart(required = false)
          MultipartFile gif) {

    Long userId = Long.parseLong(principal.getUsername());
    String safeText = sanitize(text);
    validateFiles(images, gif);
    Comment comment =
        commentUseCase.createComment(
            userId, reviewId, safeText, parseImages(images), parseGif(gif));
    return ResponseEntity.status(HttpStatus.CREATED).body(commentMapper.toResponse(comment));
  }

  @PutMapping(value = "/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Edita um comentário",
      description =
          "Atualiza o texto, imagens e/ou GIF de um comentário existente de autoria do usuário.")
  public ResponseEntity<CommentResponse> updateComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário", example = "1") @PathVariable Long commentId,
      @Parameter(description = "Novo texto do comentário (até 2000 caracteres)")
          @RequestParam
          String text,
      @Parameter(description = "URLs de imagens a remover do comentário")
          @RequestParam(required = false)
          List<String> imagesToDeleteUrls,
      @Parameter(description = "Novas imagens a adicionar (máx 5 no total)")
          @RequestPart(required = false)
          List<MultipartFile> images,
      @Parameter(description = "Novo GIF (substitui o atual)")
          @RequestPart(required = false)
          MultipartFile gif) {

    Long userId = Long.parseLong(principal.getUsername());
    String safeText = sanitize(text);
    validateFiles(images, gif);
    Comment updated =
        commentUseCase.updateComment(
            userId, commentId, safeText, parseImages(images), imagesToDeleteUrls, parseGif(gif));
    return ResponseEntity.ok(commentMapper.toResponse(updated));
  }

  @DeleteMapping("/{commentId}")
  @Operation(
      summary = "Exclui um comentário",
      description = "Remove (soft-delete) um comentário de autoria do usuário autenticado.")
  public ResponseEntity<Void> deleteComment(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do comentário", example = "1") @PathVariable Long commentId) {

    Long userId = Long.parseLong(principal.getUsername());
    commentUseCase.deleteComment(userId, commentId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  @Operation(
      summary = "Lista comentários de uma avaliação",
      description = "Retorna os comentários paginados da avaliação, ordenados do mais recente.")
  public ResponseEntity<Page<CommentBasicResponse>> getComments(
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId,
      @PageableDefault(size = 20) Pageable pageable) {

    return ResponseEntity.ok(
        commentUseCase.getComments(reviewId, pageable).map(commentMapper::toBasicResponse));
  }

  @GetMapping("/{commentId}")
  @Operation(
      summary = "Obtém um comentário por ID",
      description = "Retorna os detalhes completos de um comentário específico.")
  public ResponseEntity<CommentResponse> getComment(
      @Parameter(description = "ID do comentário", example = "1") @PathVariable Long commentId) {

    return ResponseEntity.ok(commentMapper.toResponse(commentUseCase.getCommentById(commentId)));
  }


  private String sanitize(String html) {
    if (html == null) return null;
    return Jsoup.clean(html, Safelist.none());
  }

  private void validateFiles(List<MultipartFile> images, MultipartFile gif) {
    if (images != null) {
      if (images.size() > 5) {
        throw new CommentBusinessException("Máximo 5 imagens permitidas por comentário.");
      }
      images.forEach(this::validateImageFile);
    }
    if (gif != null) {
      if (gif.getSize() > 10 * 1024 * 1024) {
        throw new CommentBusinessException("O GIF excede o limite de 10 MB.");
      }
      try {
        Tika tika = new Tika();
        String detectedType = tika.detect(gif.getInputStream());
        if (!"image/gif".equals(detectedType)) {
          throw new CommentBusinessException("O arquivo GIF deve ser do tipo image/gif validado.");
        }
      } catch (IOException e) {
        throw new CommentBusinessException("Erro ao processar o arquivo GIF.");
      }
    }
  }

  private void validateImageFile(MultipartFile file) {
    if (file.getSize() > 5 * 1024 * 1024) {
      throw new CommentBusinessException("A imagem excede o limite de 5 MB.");
    }
    try {
      Tika tika = new Tika();
      String detectedType = tika.detect(file.getInputStream());
      if (!"image/jpeg".equals(detectedType)
          && !"image/png".equals(detectedType)
          && !"image/webp".equals(detectedType)) {
        throw new CommentBusinessException("A imagem deve ser JPEG, PNG ou WebP validada.");
      }
    } catch (IOException e) {
      throw new CommentBusinessException("Erro ao processar a imagem do upload.");
    }
  }

  private List<byte[]> parseImages(List<MultipartFile> images) {
    if (images == null) return new ArrayList<>();
    return new ArrayList<>(
        images.stream()
            .map(
                img -> {
                  try {
                    return img.getBytes();
                  } catch (IOException e) {
                    throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler bytes da imagem.");
                  }
                })
            .toList());
  }

  private byte[] parseGif(MultipartFile gif) {
    if (gif == null) return null;
    try {
      return gif.getBytes();
    } catch (IOException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler bytes do GIF.");
    }
  }
}
