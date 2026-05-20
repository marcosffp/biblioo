package com.biblioo.recommendation.infrastructure.dto;

import com.biblioo.recommendation.infrastructure.dto.validation.AtLeastOnePreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@AtLeastOnePreference
public class UserPreferenceRequest {

  @Size(max = 20, message = "Máximo de 20 gêneros permitidos")
  private List<
          @NotBlank(message = "Nome do gênero não pode ser vazio")
          @Size(max = 100, message = "Nome do gênero deve ter no máximo 100 caracteres")
          String>
      genres;

  @Size(max = 50, message = "Máximo de 50 livros permitidos")
  private List<@NotNull @Positive(message = "ID do livro deve ser positivo") Long> bookIds;
}
