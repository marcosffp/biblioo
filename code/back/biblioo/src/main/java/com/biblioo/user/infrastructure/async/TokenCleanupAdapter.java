package com.biblioo.user.infrastructure.async;

import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import com.biblioo.user.domain.port.out.TokenCleanupPort;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupAdapter implements TokenCleanupPort {

  private final RefreshTokenRepositoryPort tokenRepo;

  @Async("userTaskExecutor")
  @Override
  public void scheduleCleanup(Long userId) {
    tokenRepo.deleteExpiredOrUsed(userId);
  }
}
