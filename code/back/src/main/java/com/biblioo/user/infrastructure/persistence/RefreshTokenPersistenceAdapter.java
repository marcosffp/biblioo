package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.port.out.RefreshTokenPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RefreshTokenPersistenceAdapter implements RefreshTokenPersistencePort {

  private final RefreshTokenRepository refreshTokenRepository;

  @Override
  public void deleteAllByUserId(Long userId) {
    refreshTokenRepository.deleteAllByUserId(userId);
  }
}
