package com.biblioo.user.infrastructure.auth;

import com.biblioo.user.domain.exception.EmailRegisteredWithPasswordException;
import com.biblioo.user.domain.model.GoogleUserInfo;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class GoogleUserFactory {

  private final UserRepository userRepo;


  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public User findOrCreate(GoogleUserInfo googleUser, String username) {
    return userRepo
        .findByEmail(googleUser.email())
        .map(
            existing -> {
              if (existing.getGoogleId() == null || existing.getGoogleId().isBlank()) {
                throw new EmailRegisteredWithPasswordException();
              }
              existing.setGoogleId(googleUser.googleId());
              return userRepo.save(existing);
            })
        .orElseGet(
            () -> {
              User newUser = new User();
              newUser.setUsername(username);
              newUser.setEmail(googleUser.email());
              newUser.setGoogleId(googleUser.googleId());
              newUser.setAvatarUrl(googleUser.avatarUrl());
              return userRepo.save(newUser);
            });
  }
}
