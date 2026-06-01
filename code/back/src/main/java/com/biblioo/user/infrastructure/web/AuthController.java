package com.biblioo.user.infrastructure.web;

import com.biblioo.user.domain.model.AuthResult;
import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.infrastructure.dto.AuthResponse;
import com.biblioo.user.infrastructure.dto.GoogleAuthRequest;
import com.biblioo.user.infrastructure.dto.LoginRequest;
import com.biblioo.user.infrastructure.dto.RefreshTokenRequest;
import com.biblioo.user.infrastructure.dto.RegisterRequest;
import com.biblioo.user.infrastructure.dto.mapper.UserMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Autenticação e cadastro de usuários")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthUseCase authUseCase;

  @PostMapping("/register")
  @Operation(summary = "Cadastra um novo usuário")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResult result =
        authUseCase.register(request.username(), request.email(), request.password());
    return ResponseEntity.status(HttpStatus.CREATED).body(toAuthResponse(result));
  }

  @PostMapping("/login")
  @Operation(summary = "Autentica um usuário com e-mail e senha")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    AuthResult result = authUseCase.login(request.email(), request.password());
    return ResponseEntity.ok(toAuthResponse(result));
  }

  @PostMapping("/refresh")
  @Operation(summary = "Renova o access token a partir do refresh token")
  public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    AuthResult result = authUseCase.refresh(request.refreshToken());
    return ResponseEntity.ok(toAuthResponse(result));
  }

  @PostMapping("/logout")
  @Operation(summary = "Invalida o refresh token do usuário")
  public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
    authUseCase.logout(request.refreshToken());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/google")
  @Operation(summary = "Autentica ou cadastra um usuário via Google OAuth")
  public ResponseEntity<AuthResponse> loginWithGoogle(
      @Valid @RequestBody GoogleAuthRequest request) {
    AuthResult result = authUseCase.loginWithGoogle(request.idToken());
    return ResponseEntity.ok(toAuthResponse(result));
  }

  private AuthResponse toAuthResponse(AuthResult result) {
    return new AuthResponse(
        result.accessToken(), result.refreshToken(), UserMapper.toResponse(result.user()));
  }
}
