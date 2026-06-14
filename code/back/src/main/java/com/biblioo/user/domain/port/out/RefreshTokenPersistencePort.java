package com.biblioo.user.domain.port.out;

public interface RefreshTokenPersistencePort {

  void deleteAllByUserId(Long userId);
}
