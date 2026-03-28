package com.biblioo.user.infrastructure.web;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.infrastructure.dto.UpdateProfileRequest;
import com.biblioo.user.infrastructure.dto.UpdateVisibilityRequest;
import com.biblioo.user.infrastructure.dto.UserProfileResponse;
import com.biblioo.user.infrastructure.dto.mapper.UserMapper;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

  private final UserUseCase userUseCase;

  @GetMapping("/me")
  public ResponseEntity<UserProfileResponse> getMe(
      @AuthenticationPrincipal UserDetails principal) {
    User user = userUseCase.getById(currentUserId(principal));
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @GetMapping("/{username}")
  public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username) {
    User user = userUseCase.getByUsername(username);
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PutMapping("/me")
  public ResponseEntity<UserProfileResponse> updateProfile(
      @Valid @RequestBody UpdateProfileRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    User user =
        userUseCase.updateProfile(
            currentUserId(principal), request.bio(), request.avatarUrl(), request.bannerUrl());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PutMapping("/me/visibility")
  public ResponseEntity<UserProfileResponse> updateVisibility(
      @RequestBody UpdateVisibilityRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    User user = userUseCase.updateVisibility(currentUserId(principal), request.isPrivate());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<UserProfileResponse> uploadAvatar(
      @RequestParam("file") MultipartFile file,
      @AuthenticationPrincipal UserDetails principal) throws IOException {
    User user = userUseCase.uploadAvatar(currentUserId(principal), file.getBytes());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping(value = "/me/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<UserProfileResponse> uploadBanner(
      @RequestParam("file") MultipartFile file,
      @AuthenticationPrincipal UserDetails principal) throws IOException {
    User user = userUseCase.uploadBanner(currentUserId(principal), file.getBytes());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping("/{username}/follow")
  public ResponseEntity<Void> follow(
      @PathVariable String username, @AuthenticationPrincipal UserDetails principal) {
    Long targetId = userUseCase.getByUsername(username).getId();
    userUseCase.follow(currentUserId(principal), targetId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{username}/follow")
  public ResponseEntity<Void> unfollow(
      @PathVariable String username, @AuthenticationPrincipal UserDetails principal) {
    Long targetId = userUseCase.getByUsername(username).getId();
    userUseCase.unfollow(currentUserId(principal), targetId);
    return ResponseEntity.noContent().build();
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
