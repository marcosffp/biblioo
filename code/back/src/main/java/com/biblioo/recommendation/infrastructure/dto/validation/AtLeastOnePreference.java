package com.biblioo.recommendation.infrastructure.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = AtLeastOnePreferenceValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AtLeastOnePreference {
  String message() default "Selecione pelo menos 1 gênero ou 1 livro";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
