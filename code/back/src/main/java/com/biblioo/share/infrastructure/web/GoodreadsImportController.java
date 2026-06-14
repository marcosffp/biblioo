package com.biblioo.share.infrastructure.web;

import com.biblioo.share.domain.model.GoodreadsImportResult;
import com.biblioo.share.domain.port.in.GoodreadsImportUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/import")
@RequiredArgsConstructor
@Tag(name = "Import", description = "Importação de biblioteca de plataformas externas")
public class GoodreadsImportController {

  private final GoodreadsImportUseCase goodreadsImportUseCase;

  @PostMapping(value = "/goodreads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Importa biblioteca do Goodreads",
      description =
          "Recebe o arquivo CSV exportado pelo Goodreads e importa os livros para a estante "
              + "\"Importação Goodreads\" do usuário autenticado. "
              + "Limite: 10MB / 10.000 linhas por importação.")
  public ResponseEntity<GoodreadsImportResult> importGoodreads(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(
              description = "Arquivo CSV exportado pelo Goodreads (goodreads_library_export.csv)",
              content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
          @RequestParam("file")
          MultipartFile file) {

    Long userId = Long.parseLong(principal.getUsername());

    try {
      GoodreadsImportResult result =
          goodreadsImportUseCase.importCsv(
              userId, file.getInputStream(), file.getOriginalFilename());
      return ResponseEntity.ok(result);
    } catch (IOException e) {
      throw new com.biblioo.share.domain.exception.GoodreadsImportException(
          "Não foi possível ler o arquivo enviado: " + e.getMessage());
    }
  }
}
