package com.biblioo.user.domain.port.in;

import com.biblioo.user.domain.model.PasswordResetResponse;

public interface PasswordResetUseCase {


  void resetPassword(String token, String newPassword);

  void createPassword(Long userId, String newPassword);

PasswordResetResponse requestPasswordReset(String email, String clientType);
}
