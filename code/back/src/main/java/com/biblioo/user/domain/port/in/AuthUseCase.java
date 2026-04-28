package com.biblioo.user.domain.port.in;

import com.biblioo.user.domain.model.AuthResult;

public interface AuthUseCase {

  AuthResult register(String username, String email, String rawPassword);

  AuthResult login(String email, String rawPassword);

  AuthResult refresh(String refreshToken);

  void logout(String refreshToken);

  AuthResult loginWithGoogle(String idToken);
}
