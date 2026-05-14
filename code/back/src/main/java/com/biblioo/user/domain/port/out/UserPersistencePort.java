package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.User;
import java.util.Optional;

public interface UserPersistencePort {

  Optional<User> findById(Long id);

  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  User save(User user);

  void deleteById(Long id);
}
