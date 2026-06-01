package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.UserPreference;
import java.util.List;

public interface UserPreferenceUseCase {
  UserPreference savePreferences(Long userId, List<String> genres, List<Long> bookIds);
}
