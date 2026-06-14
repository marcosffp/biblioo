package com.biblioo.community.infrastructure.config;

import com.biblioo.community.domain.port.in.BookVotingUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class VotingScheduler {

  private final BookVotingUseCase bookVotingUseCase;

  @Scheduled(fixedDelay = 60_000)
  public void closeExpiredVotings() {
    bookVotingUseCase.closeExpiredVotings();
  }
}
