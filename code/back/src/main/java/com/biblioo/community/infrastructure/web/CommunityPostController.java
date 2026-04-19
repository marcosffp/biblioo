package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.model.CommunityPost;
import com.biblioo.community.domain.port.in.CommunityPostUseCase;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import com.biblioo.community.infrastructure.dto.CommunityPostResponse;
import com.biblioo.community.infrastructure.dto.mapper.CommunityPostMapper;
import com.biblioo.feed.infrastructure.dto.like.LikeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/communities/{communityId}/posts")
@RequiredArgsConstructor
@Tag(name = "Community Posts", description = "Feed de posts dentro de uma comunidade")
public class CommunityPostController {

  private final CommunityPostUseCase postUseCase;
  private final CommunityUseCase communityUseCase;
  private final CommunityPostMapper postMapper;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Criar um post na comunidade")
  public ResponseEntity<CommunityPostResponse> createPost(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @RequestParam(value = "text", required = false) String text,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      @RequestPart(value = "gif", required = false) MultipartFile gif,
      @RequestParam(value = "tags", required = false) List<String> tags,
      @RequestParam(value = "hasSpoiler", required = false) Boolean hasSpoiler,
      @RequestParam(value = "pageRef", required = false) Integer pageRef) {

    Long userId = currentUserId(principal);

    if (text != null && text.length() > 2000) {
      throw new CommunityBusinessException("O texto do post não deve exceder 2000 caracteres.");
    }

    String safeText = sanitize(text);
    validateFiles(images, gif);

    List<byte[]> imageBytes = parseImages(images);
    byte[] gifBytes = parseGif(gif);

    CommunityPost post =
        postUseCase.createPost(
            userId, communityId, safeText, imageBytes, gifBytes, tags, hasSpoiler, pageRef);

    return ResponseEntity.status(HttpStatus.CREATED).body(postMapper.toResponse(post));
  }

  @GetMapping
  @Operation(summary = "Feed da comunidade")
  public ResponseEntity<Page<CommunityPostResponse>> feed(
      @PathVariable Long communityId,
      @AuthenticationPrincipal UserDetails principal,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {

    communityUseCase.getCommunityForViewer(viewerId(principal), communityId);

    Page<CommunityPostResponse> page =
        postUseCase.getCommunityFeed(communityId, pageable).map(postMapper::toResponse);
    return ResponseEntity.ok(page);
  }

  @GetMapping("/{postId}")
  @Operation(summary = "Obter um post")
  public ResponseEntity<CommunityPostResponse> getPost(
      @PathVariable Long communityId,
      @PathVariable Long postId,
      @AuthenticationPrincipal UserDetails principal) {

    communityUseCase.getCommunityForViewer(viewerId(principal), communityId);

    CommunityPost post = postUseCase.getPostById(postId);
    if (!post.getCommunityId().equals(communityId)) {
      throw new CommunityBusinessException("Post não pertence a esta comunidade.");
    }
    return ResponseEntity.ok(postMapper.toResponse(post));
  }

  @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Editar um post")
  public ResponseEntity<CommunityPostResponse> updatePost(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long postId,
      @RequestParam(value = "text", required = false) String text,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      @RequestParam(value = "imagesToDeleteUrls", required = false) List<String> imagesToDeleteUrls,
      @RequestPart(value = "gif", required = false) MultipartFile gif,
      @RequestParam(value = "tags", required = false) List<String> tags,
      @RequestParam(value = "hasSpoiler", required = false) Boolean hasSpoiler,
      @RequestParam(value = "pageRef", required = false) Integer pageRef) {

    if (text != null && text.length() > 2000) {
      throw new CommunityBusinessException("O texto do post não deve exceder 2000 caracteres.");
    }

    String safeText = sanitize(text);
    validateFiles(images, gif);

    CommunityPost post =
        postUseCase.updatePost(
            currentUserId(principal),
            postId,
            safeText,
            parseImages(images),
            imagesToDeleteUrls,
            parseGif(gif),
            tags,
            hasSpoiler,
            pageRef);

    return ResponseEntity.ok(postMapper.toResponse(post));
  }

  @DeleteMapping("/{postId}")
  @Operation(summary = "Excluir um post")
  public ResponseEntity<Void> deletePost(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long postId) {
    postUseCase.deletePost(currentUserId(principal), postId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{postId}/like")
  @Operation(summary = "Curtir/descurtir um post")
  public ResponseEntity<LikeResponse> likePost(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long postId) {
    boolean liked = postUseCase.likePost(currentUserId(principal), postId);
    return ResponseEntity.ok(new LikeResponse(liked));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }

  private Long viewerId(UserDetails principal) {
    return principal != null ? currentUserId(principal) : null;
  }

  private String sanitize(String html) {
    if (html == null) return null;
    return Jsoup.clean(html, Safelist.none());
  }

  private void validateFiles(List<MultipartFile> images, MultipartFile gif) {
    if (images != null) {
      if (images.size() > 5) {
        throw new CommunityBusinessException("Máximo 5 imagens permitidas.");
      }
      images.forEach(this::validateImageFile);
    }
    if (gif != null) {
      if (gif.getSize() > 10 * 1024 * 1024) {
        throw new CommunityBusinessException("O limite de tamanho do GIF foi excedido.");
      }
      try {
        Tika tika = new Tika();
        String detectedType = tika.detect(gif.getInputStream());
        if (!"image/gif".equals(detectedType)) {
          throw new CommunityBusinessException("O GIF deve ser do tipo image/gif.");
        }
      } catch (IOException e) {
        throw new CommunityBusinessException("Erro ao processar o arquivo GIF.");
      }
    }
  }

  private void validateImageFile(MultipartFile file) {
    if (file.getSize() > 5 * 1024 * 1024) {
      throw new CommunityBusinessException("O limite de tamanho da imagem foi excedido.");
    }
    try {
      Tika tika = new Tika();
      String detectedType = tika.detect(file.getInputStream());
      if (!"image/jpeg".equals(detectedType)
          && !"image/png".equals(detectedType)
          && !"image/webp".equals(detectedType)) {
        throw new CommunityBusinessException("A imagem deve ser JPEG, PNG ou WebP.");
      }
    } catch (IOException e) {
      throw new CommunityBusinessException("Erro ao processar a imagem.");
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
                        HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler os bytes da imagem.");
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
          HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler os bytes do GIF.");
    }
  }
}
