package com.biblioo.user.infrastructure.external;

import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedUserAdapter implements UserPort {

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
}
