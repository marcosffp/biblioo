package com.biblioo.user.infrastructure.security;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDetailsServiceAdapter implements UserDetailsService {

  private final UserRepositoryPort userRepo;

  /** username aqui é o userId em string (subject do JWT). */
  @Override
  public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
    User user =
        userRepo
            .findById(Long.parseLong(userId))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

    return org.springframework.security.core.userdetails.User.withUsername(user.getId().toString())
        .password(user.getPasswordHash())
        .roles("USER")
        .build();
  }
}
