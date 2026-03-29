package com.biblioo.user.infrastructure.async;

import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupAdapter {

  private final RefreshTokenRepositoryPort tokenRepo;

  @Async("userTaskExecutor")
  public void scheduleCleanup(Long userId) {
    tokenRepo.deleteExpiredOrUsed(userId);
  }
}
