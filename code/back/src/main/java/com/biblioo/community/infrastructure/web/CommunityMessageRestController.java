package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.infrastructure.dto.MessageMediaUploadResponse;
import com.biblioo.community.infrastructure.dto.MessageResponse;
import com.biblioo.community.infrastructure.dto.mapper.CommunityMessageMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/communities/{communityId}/messages")
@RequiredArgsConstructor
@Tag(
    name = "Community Messages",
    description = "Histórico e sincronização de mensagens de comunidades")
public class CommunityMessageRestController {

  private static final Tika TIKA = new Tika();

  private final CommunityMessageUseCase messageUseCase;
  private final CommunityMessageMapper mapper;

  @GetMapping
  @Operation(summary = "Buscar histórico de mensagens (cursor-based)")
  public ResponseEntity<List<MessageResponse>> getMessages(
      @PathVariable Long communityId,
      @RequestParam(required = false) Long before,
      @RequestParam(defaultValue = "50") int limit,
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());
    List<MessageResponse> messages;
    if (before != null) {
      messages =
          mapper.toResponseList(
              messageUseCase.getMessagesBefore(communityId, before, limit, userId));
    } else {
      messages = mapper.toResponseList(messageUseCase.getRecentMessages(communityId, userId));
    }
    return ResponseEntity.ok(messages);
  }

  @GetMapping("/sync")
  @Operation(summary = "Sincronizar mensagens perdidas após reconexão")
  public ResponseEntity<List<MessageResponse>> syncAfter(
      @PathVariable Long communityId,
      @RequestParam Long after,
      @AuthenticationPrincipal UserDetails principal) {

    return ResponseEntity.ok(
        mapper.toResponseList(messageUseCase.getMessagesAfter(communityId, after)));
  }

  @PostMapping(value = "/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Upload de imagens e/ou GIF para uma mensagem",
      description =
          "Faz upload de até 5 imagens (JPEG/PNG/WebP, máx 5 MB cada) e/ou 1 GIF (máx 10 MB). "
              + "Retorna as URLs já hospedadas no Cloudinary para incluir no payload STOMP.")
  public ResponseEntity<MessageMediaUploadResponse> uploadMedia(
      @PathVariable Long communityId,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      @RequestPart(value = "gif", required = false) MultipartFile gif,
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());

    validateMediaFiles(images, gif);

    List<byte[]> imageBytes = parseFiles(images);
    byte[] gifBytes = parseGif(gif);

    MessageMediaUploadResponse response =
        messageUseCase.uploadMessageMedia(communityId, userId, imageBytes, gifBytes);

    return ResponseEntity.ok(response);
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  private void validateMediaFiles(List<MultipartFile> images, MultipartFile gif) {
    if (images != null) {
      if (images.size() > 5) {
        throw new CommunityBusinessException("Máximo de 5 imagens por mensagem.");
      }
      images.forEach(this::validateImageFile);
    }
    if (gif != null && !gif.isEmpty()) {
      if (gif.getSize() > 10L * 1024 * 1024) {
        throw new CommunityBusinessException("O GIF não pode exceder 10 MB.");
      }
      try {
        String mime = TIKA.detect(gif.getInputStream());
        if (!"image/gif".equals(mime)) {
          throw new CommunityBusinessException("O arquivo GIF deve ser do tipo image/gif.");
        }
      } catch (IOException e) {
        throw new CommunityBusinessException("Erro ao processar o arquivo GIF.");
      }
    }
  }

  private void validateImageFile(MultipartFile file) {
    if (file.getSize() > 5L * 1024 * 1024) {
      throw new CommunityBusinessException("Cada imagem não pode exceder 5 MB.");
    }
    try {
      String mime = TIKA.detect(file.getInputStream());
      if (!"image/jpeg".equals(mime) && !"image/png".equals(mime) && !"image/webp".equals(mime)) {
        throw new CommunityBusinessException("Imagens devem ser JPEG, PNG ou WebP.");
      }
    } catch (IOException e) {
      throw new CommunityBusinessException("Erro ao processar imagem.");
    }
  }

  private List<byte[]> parseFiles(List<MultipartFile> files) {
    if (files == null) return new ArrayList<>();
    return files.stream()
        .map(
            f -> {
              try {
                return f.getBytes();
              } catch (IOException e) {
                throw new CommunityBusinessException("Erro ao ler arquivo.");
              }
            })
        .toList();
  }

  private byte[] parseGif(MultipartFile gif) {
    if (gif == null || gif.isEmpty()) return null;
    try {
      return gif.getBytes();
    } catch (IOException e) {
      throw new CommunityBusinessException("Erro ao ler GIF.");
    }
  }
}
