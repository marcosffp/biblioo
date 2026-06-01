package com.biblioo.community.infrastructure.external;

import com.biblioo.community.domain.port.out.TypingUserPort;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserAvatarAdapter implements TypingUserPort {

  private final UserRepository userRepository;

  @Override
  public String getAvatarUrl(Long userId) {
    return userRepository.findAvatarUrlById(userId).orElse(null);
  }
}
