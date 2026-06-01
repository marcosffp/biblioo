package com.biblioo.recommendation.infrastructure.dto.validation;

import com.biblioo.recommendation.infrastructure.dto.UserPreferenceRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AtLeastOnePreferenceValidator
    implements ConstraintValidator<AtLeastOnePreference, UserPreferenceRequest> {

  @Override
  public boolean isValid(UserPreferenceRequest req, ConstraintValidatorContext ctx) {
    if (req == null) return false;
    boolean hasGenres = req.getGenres() != null && !req.getGenres().isEmpty();
    boolean hasBooks = req.getBookIds() != null && !req.getBookIds().isEmpty();
    return hasGenres || hasBooks;
  }
}
