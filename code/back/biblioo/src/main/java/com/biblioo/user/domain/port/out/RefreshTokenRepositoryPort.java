package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.RefreshToken;
import java.util.Optional;

public interface RefreshTokenRepositoryPort {

  Optional<RefreshToken> findByToken(String token);

  RefreshToken save(RefreshToken token);

  void deleteAllByUserId(Long userId);

  void deleteExpiredOrUsed(Long userId);
}
