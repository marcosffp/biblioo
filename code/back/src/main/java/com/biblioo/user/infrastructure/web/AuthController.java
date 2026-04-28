package com.biblioo.user.infrastructure.web;

import com.biblioo.user.domain.model.AuthResult;
import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.infrastructure.dto.AuthResponse;
import com.biblioo.user.infrastructure.dto.GoogleAuthRequest;
import com.biblioo.user.infrastructure.dto.LoginRequest;
import com.biblioo.user.infrastructure.dto.RefreshTokenRequest;
import com.biblioo.user.infrastructure.dto.RegisterRequest;
import com.biblioo.user.infrastructure.dto.mapper.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthUseCase authUseCase;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResult result =
        authUseCase.register(request.username(), request.email(), request.password());
    return ResponseEntity.status(HttpStatus.CREATED).body(toAuthResponse(result));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    AuthResult result = authUseCase.login(request.email(), request.password());
    return ResponseEntity.ok(toAuthResponse(result));
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    AuthResult result = authUseCase.refresh(request.refreshToken());
    return ResponseEntity.ok(toAuthResponse(result));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
    authUseCase.logout(request.refreshToken());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/google")
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
