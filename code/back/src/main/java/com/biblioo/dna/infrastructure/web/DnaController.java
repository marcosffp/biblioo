package com.biblioo.dna.infrastructure.web;

import com.biblioo.dna.domain.model.DnaStatus;
import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.dna.domain.port.in.LiteraryDnaUseCase;
import com.biblioo.dna.infrastructure.dto.DnaProgressResponse;
import com.biblioo.dna.infrastructure.dto.DnaResponse;
import com.biblioo.dna.infrastructure.dto.mapper.DnaMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dna")
@RequiredArgsConstructor
@Validated
@Tag(name = "DNA Literário", description = "Perfil literário personalizado do usuário")
public class DnaController {

  private final LiteraryDnaUseCase literaryDnaUseCase;
  private final DnaMapper dnaMapper;

  @GetMapping
  @Operation(summary = "Retorna o DNA literário do usuário autenticado")
  public ResponseEntity<?> getDna(@AuthenticationPrincipal UserDetails principal) {
    Long userId = extractUserId(principal);
    LiteraryDna dna = literaryDnaUseCase.getDna(userId);

    if (dna.getStatus() == DnaStatus.IN_FORMATION || dna.getStatus() == DnaStatus.COMPUTING) {
      DnaProgressResponse progress = dnaMapper.toProgressResponse(dna);
      return ResponseEntity.ok(progress);
    }

    DnaResponse response = dnaMapper.toResponse(dna);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{userId}")
  @Operation(summary = "Retorna o DNA literário de um usuário pelo ID")
  public ResponseEntity<?> getDna(@PathVariable Long userId) {
    LiteraryDna dna = literaryDnaUseCase.getDna(userId);

    if (dna.getStatus() == DnaStatus.IN_FORMATION || dna.getStatus() == DnaStatus.COMPUTING) {
      DnaProgressResponse progress = dnaMapper.toProgressResponse(dna);
      return ResponseEntity.ok(progress);
    }

    DnaResponse response = dnaMapper.toResponse(dna);
    return ResponseEntity.ok(response);
  }

  private Long extractUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
