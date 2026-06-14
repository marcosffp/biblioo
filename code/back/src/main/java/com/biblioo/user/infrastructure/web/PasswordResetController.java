package com.biblioo.user.infrastructure.web;

import com.biblioo.user.domain.model.PasswordResetResponse;
import com.biblioo.user.domain.port.in.PasswordResetUseCase;
import com.biblioo.user.infrastructure.dto.CreatePasswordRequest;
import com.biblioo.user.infrastructure.dto.ForgotPasswordRequest;
import com.biblioo.user.infrastructure.dto.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Autenticação e cadastro de usuários")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordResetController {

  private final PasswordResetUseCase passwordResetUseCase;

  @PostMapping("/forgot-password")
  @Operation(summary = "Solicita link de redefinição de senha por e-mail")
  public ResponseEntity<PasswordResetResponse> forgotPassword(
      @Valid @RequestBody ForgotPasswordRequest request,
      @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) {
    return ResponseEntity.ok(
        passwordResetUseCase.requestPasswordReset(request.email(), clientType));
  }

  @PostMapping("/reset-password")
  @Operation(summary = "Redefine a senha usando o token recebido por e-mail")
  public ResponseEntity<PasswordResetResponse> resetPassword(
      @Valid @RequestBody ResetPasswordRequest request) {
    if (!request.newPassword().equals(request.confirmPassword())) {
      throw new IllegalArgumentException("As senhas não coincidem.");
    }
    passwordResetUseCase.resetPassword(request.token(), request.newPassword());
    return ResponseEntity.ok(new PasswordResetResponse("Senha redefinida com sucesso."));
  }

  @PostMapping("/create-password")
  @Operation(summary = "Cria uma senha para conta vinculada ao Google (sem senha prévia)")
  public ResponseEntity<PasswordResetResponse> createPassword(
      @AuthenticationPrincipal UserDetails principal,
      @Valid @RequestBody CreatePasswordRequest request) {
    if (!request.newPassword().equals(request.confirmPassword())) {
      throw new IllegalArgumentException("As senhas não coincidem.");
    }
    Long userId = Long.parseLong(principal.getUsername());
    passwordResetUseCase.createPassword(userId, request.newPassword());
    return ResponseEntity.ok(new PasswordResetResponse("Senha criada com sucesso."));
  }
}
