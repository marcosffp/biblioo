package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.User;
import java.util.Optional;

public interface UserRepositoryPort {

  Optional<User> findById(Long id);

  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByEmail(String email);

  boolean existsByUsername(String username);

  User save(User user);
}
