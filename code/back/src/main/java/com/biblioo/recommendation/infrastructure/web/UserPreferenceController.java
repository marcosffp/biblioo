package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.recommendation.domain.model.UserPreference;
import com.biblioo.recommendation.domain.port.in.UserPreferenceUseCase;
import com.biblioo.recommendation.infrastructure.dto.UserPreferenceRequest;
import com.biblioo.recommendation.infrastructure.dto.UserPreferenceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/preferences")
@RequiredArgsConstructor
@Tag(name = "Preferences", description = "Preferências de leitura do usuário (onboarding)")
public class UserPreferenceController {

  private final UserPreferenceUseCase preferenceUseCase;

  @PostMapping
  @Operation(
      summary = "Configurar preferências do usuário (uma vez)",
      description =
          "Salva os gêneros e livros preferidos do usuário no onboarding. "
              + "Só pode ser chamado uma vez por usuário — retorna 422 se preferências já existem. "
              + "Os gêneros devem ser os valores 'original' retornados por GET /genres. "
              + "Requer pelo menos 1 gênero OU 1 livro. Máx: 20 gêneros e 50 livros. "
              + "Após salvar, dispara automaticamente as trilhas de recomendação (T1 e T2).")
  public ResponseEntity<UserPreferenceResponse> savePreferences(
      @AuthenticationPrincipal UserDetails principal,
      @Valid @RequestBody UserPreferenceRequest request) {

    Long userId = Long.parseLong(principal.getUsername());
    List<String> genres = request.getGenres() != null ? request.getGenres() : List.of();
    List<Long> bookIds = request.getBookIds() != null ? request.getBookIds() : List.of();

    UserPreference saved = preferenceUseCase.savePreferences(userId, genres, bookIds);
    return ResponseEntity.ok(UserPreferenceResponse.from(saved));
  }
}
