package com.biblioo.user.infrastructure.async;

import com.biblioo.user.infrastructure.persistence.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupAdapter {

  private final RefreshTokenRepository tokenRepo;

  @Async("userTaskExecutor")
  public void scheduleCleanup(Long userId) {
    tokenRepo.deleteExpiredOrUsed(userId);
  }
}
