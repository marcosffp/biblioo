package com.biblioo.share.infrastructure.web;

import com.biblioo.share.domain.port.in.ShareCardUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/share")
@RequiredArgsConstructor
@Tag(name = "Share", description = "Geração de cards de compartilhamento em PNG")
@Validated
public class ShareCardController {

  private final ShareCardUseCase shareCardUseCase;

  @GetMapping("/card")
  @Operation(summary = "Gera card de compartilhamento como PNG (1080×1080)")
  public ResponseEntity<byte[]> getCard(
      @AuthenticationPrincipal UserDetails principal,
      @RequestParam(defaultValue = "dna") String type) {

    Long userId = Long.parseLong(principal.getUsername());

    byte[] png =
        switch (type) {
          case "dna" -> shareCardUseCase.generateDnaCard(userId);
          default -> shareCardUseCase.generateDnaCard(userId);
        };

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"biblioo-card.png\"")
        .contentType(MediaType.IMAGE_PNG)
        .body(png);
  }
}
