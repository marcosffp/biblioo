package com.biblioo.user.domain.port.out;

public interface PasswordResetEmailPort {

  void sendPasswordResetEmail(String toEmail, String username, String resetLink);

  void sendPasswordChangedConfirmation(String toEmail, String username);
}
