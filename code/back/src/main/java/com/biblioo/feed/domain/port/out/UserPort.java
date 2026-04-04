package com.biblioo.feed.domain.port.out;

import com.biblioo.user.domain.model.User;
import java.util.List;

public interface UserPort {
  User getUserById(Long userId);

  boolean existsById(Long userId);

  List<User> getUsersByIds(List<Long> userIds);
}
