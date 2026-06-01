package com.biblioo.infrastructure.config.seed;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class FollowSeedService {

  private final UserUseCase userUseCase;

  public void createFollows(List<User> users) {
    if (users.size() >= 2) {
      try {
        if (userUseCase.isFollowing(users.get(0).getId(), users.get(1).getId())) {
          log.info("[Seed-Follows] Relações de seguir já existem. Ignorando.");
          return;
        }
      } catch (Exception ignored) {
      }
    }

    Random rng = new Random(42L);
    for (int i = 0; i < users.size(); i++) {
      User follower = users.get(i);
      Set<Integer> followed = new HashSet<>();
      int attempts = 0;

      while (followed.size() < 3 && attempts < 30) {
        attempts++;
        int targetIdx = rng.nextInt(users.size());
        if (targetIdx == i || followed.contains(targetIdx)) continue;

        User target = users.get(targetIdx);
        try {
          if (userUseCase.isFollowing(follower.getId(), target.getId())) {
            followed.add(targetIdx);
            continue;
          }
          FollowStatus status = userUseCase.follow(follower.getId(), target.getId());
          if (status == FollowStatus.PENDING) {
            userUseCase.acceptFollowRequest(target.getId(), follower.getId());
          }
          followed.add(targetIdx);
          log.debug("[Seed-Follows] {} → {}.", follower.getUsername(), target.getUsername());
        } catch (Exception e) {
          log.debug(
              "[Seed-Follows] Ignorado ({} → {}): {}",
              follower.getUsername(),
              target.getUsername(),
              e.getMessage());
        }
      }
    }
  }
}
