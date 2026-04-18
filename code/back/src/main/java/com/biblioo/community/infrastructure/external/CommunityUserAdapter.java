package com.biblioo.community.infrastructure.external;

import com.biblioo.community.domain.model.CommunityUserSummary;
import com.biblioo.community.domain.port.out.CommunityUserLookupPort;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommunityUserAdapter implements CommunityUserLookupPort {

  private final UserRepository userRepository;

  @Override
  public boolean existsById(Long userId) {
    return userRepository.existsById(userId);
  }

  @Override
  public CommunityUserSummary getById(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) return null;
    return new CommunityUserSummary(user.getId(), user.getUsername(), user.getAvatarUrl());
  }
}
