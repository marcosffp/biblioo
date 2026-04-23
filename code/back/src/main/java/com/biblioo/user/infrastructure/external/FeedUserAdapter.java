package com.biblioo.user.infrastructure.external;

import com.biblioo.community.domain.model.CommunityUserSummary;
import com.biblioo.community.domain.port.out.CommunityUserLookupPort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedUserAdapter implements UserPort, CommunityUserLookupPort {

  private final UserRepository userRepository;

  @Override
  public User getUserById(Long userId) {
    return userRepository.findById(userId).orElse(null);
  }

  @Override
  public boolean existsById(Long userId) {
    return userRepository.existsById(userId);
  }

  @Override
  public List<User> getUsersByIds(List<Long> userIds) {
    return userRepository.findAllById(userIds);
  }

  @Override
  public CommunityUserSummary getById(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) return null;
    return new CommunityUserSummary(user.getId(), user.getUsername(), user.getAvatarUrl());
  }
}
