package com.biblioo.user.infrastructure.web;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.infrastructure.dto.FollowPageResponse;
import com.biblioo.user.infrastructure.dto.UpdateProfileRequest;
import com.biblioo.user.infrastructure.dto.UpdateVisibilityRequest;
import com.biblioo.user.infrastructure.dto.UserProfileResponse;
import com.biblioo.user.infrastructure.dto.UserSummaryResponse;
import com.biblioo.user.infrastructure.dto.mapper.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
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
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gerenciamento de perfis e relacionamentos entre leitores")
public class UserController {

  private final UserUseCase userUseCase;

  @GetMapping("/me")
  @Operation(summary = "Retorna o perfil do usuário autenticado")
  public ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
    User user = userUseCase.getById(currentUserId(principal));
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @GetMapping("/{username}")
  @Operation(
      summary = "Retorna o perfil de um usuário pelo username",
      description =
          "Acessível sem autenticação. Perfis privados retornam apenas username, avatar e banner com `restricted=true`.")
  public ResponseEntity<UserProfileResponse> getProfile(
      @PathVariable String username, @AuthenticationPrincipal UserDetails principal) {
    ProfileAccess access = userUseCase.getProfile(viewerIdOrNull(principal), username);
    return ResponseEntity.ok(
        access.restricted()
            ? UserMapper.toRestrictedResponse(access.user())
            : UserMapper.toResponse(access.user()));
  }

  @PutMapping("/me")
  @Operation(
      summary = "Atualiza o perfil do usuário autenticado",
      description = "Todos os campos são opcionais — envie apenas o que deseja alterar.")
  public ResponseEntity<UserProfileResponse> updateProfile(
      @Valid @RequestBody UpdateProfileRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    User user =
        userUseCase.updateProfile(
            currentUserId(principal), request.bio(), request.avatarUrl(), request.bannerUrl());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PutMapping("/me/visibility")
  @Operation(summary = "Altera a visibilidade do perfil (público/privado)")
  public ResponseEntity<UserProfileResponse> updateVisibility(
      @RequestBody UpdateVisibilityRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    User user = userUseCase.updateVisibility(currentUserId(principal), request.isPrivate());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Faz upload da foto de perfil",
      description =
          "Upload assíncrono para o Cloudinary. Máximo 5MB. Tipos aceitos: image/jpeg, image/png, image/webp.")
  public ResponseEntity<UserProfileResponse> uploadAvatar(
      @RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails principal)
      throws IOException {
    validateImageFile(file);
    User user = userUseCase.uploadAvatar(currentUserId(principal), file.getBytes());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping(value = "/me/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Faz upload do banner de perfil",
      description =
          "Upload assíncrono para o Cloudinary. Máximo 5MB. Tipos aceitos: image/jpeg, image/png, image/webp.")
  public ResponseEntity<UserProfileResponse> uploadBanner(
      @RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails principal)
      throws IOException {
    validateImageFile(file);
    User user = userUseCase.uploadBanner(currentUserId(principal), file.getBytes());
    return ResponseEntity.ok(UserMapper.toResponse(user));
  }

  @PostMapping("/{username}/follow")
  @Operation(
      summary = "Segue um usuário pelo username",
      description =
          "Para perfis públicos retorna 204. Para perfis privados envia uma solicitação e retorna 202.")
  public ResponseEntity<Void> follow(
      @PathVariable String username, @AuthenticationPrincipal UserDetails principal) {
    Long targetId = userUseCase.getByUsername(username).getId();
    FollowStatus status = userUseCase.follow(currentUserId(principal), targetId);
    return status == FollowStatus.PENDING
        ? ResponseEntity.accepted().build()
        : ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{username}/follow")
  @Operation(summary = "Deixa de seguir um usuário pelo username")
  public ResponseEntity<Void> unfollow(
      @PathVariable String username, @AuthenticationPrincipal UserDetails principal) {
    Long targetId = userUseCase.getByUsername(username).getId();
    userUseCase.unfollow(currentUserId(principal), targetId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me/follow-requests")
  @Operation(summary = "Lista as solicitações de seguir pendentes recebidas")
  public ResponseEntity<FollowPageResponse> getPendingFollowRequests(
      @Parameter(description = "Página (0-based)", example = "0") @RequestParam(defaultValue = "0")
          int page,
      @Parameter(description = "Itens por página", example = "20")
          @RequestParam(defaultValue = "20")
          int size,
      @AuthenticationPrincipal UserDetails principal) {
    List<UserSummaryResponse> users =
        userUseCase.getPendingFollowRequests(currentUserId(principal), page, size).stream()
            .map(UserMapper::toSummary)
            .toList();
    return ResponseEntity.ok(new FollowPageResponse(users, page, size, users.size() == size));
  }

  @PostMapping("/me/follow-requests/{requesterUsername}/accept")
  @Operation(summary = "Aceita uma solicitação de seguir")
  public ResponseEntity<Void> acceptFollowRequest(
      @PathVariable String requesterUsername, @AuthenticationPrincipal UserDetails principal) {
    Long requesterId = userUseCase.getByUsername(requesterUsername).getId();
    userUseCase.acceptFollowRequest(currentUserId(principal), requesterId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/me/follow-requests/{requesterUsername}")
  @Operation(summary = "Rejeita uma solicitação de seguir")
  public ResponseEntity<Void> rejectFollowRequest(
      @PathVariable String requesterUsername, @AuthenticationPrincipal UserDetails principal) {
    Long requesterId = userUseCase.getByUsername(requesterUsername).getId();
    userUseCase.rejectFollowRequest(currentUserId(principal), requesterId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/me")
  @Operation(
      summary = "Deleta a conta do usuário autenticado",
      description =
          "Remove tokens, relações de follow e a conta permanentemente. Ação irreversível.")
  public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserDetails principal) {
    userUseCase.deleteAccount(currentUserId(principal));
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  @Operation(
      summary = "Busca usuários por username",
      description =
          "Busca por prefixo via OpenSearch. Mínimo 2 caracteres. Sem autenticação necessária.")
  public ResponseEntity<FollowPageResponse> searchUsers(
      @Parameter(description = "Termo de busca (mínimo 2 caracteres)", example = "rafael")
          @RequestParam
          String q,
      @Parameter(description = "Página (0-based)", example = "0") @RequestParam(defaultValue = "0")
          int page,
      @Parameter(description = "Itens por página (máx 20)", example = "20")
          @RequestParam(defaultValue = "20")
          int size) {
    if (q == null || q.isBlank() || q.length() < 2) {
      return ResponseEntity.ok(new FollowPageResponse(List.of(), page, size, false));
    }
    List<UserSummaryResponse> users =
        userUseCase.searchUsers(q.trim(), page, size).stream().map(UserMapper::toSummary).toList();
    return ResponseEntity.ok(new FollowPageResponse(users, page, size, users.size() == size));
  }

  @GetMapping("/{username}/followers")
  @Operation(
      summary = "Lista os seguidores de um usuário",
      description = "Paginado. Retorna lista vazia para perfis privados sem acesso.")
  public ResponseEntity<FollowPageResponse> getFollowers(
      @PathVariable String username,
      @Parameter(description = "Página (0-based)", example = "0") @RequestParam(defaultValue = "0")
          int page,
      @Parameter(description = "Itens por página", example = "20")
          @RequestParam(defaultValue = "20")
          int size,
      @AuthenticationPrincipal UserDetails principal) {
    ProfileAccess access = userUseCase.getProfile(viewerIdOrNull(principal), username);
    if (access.restricted()) {
      return ResponseEntity.ok(new FollowPageResponse(List.of(), page, size, false));
    }
    List<UserSummaryResponse> users =
        userUseCase.getFollowers(access.user().getId(), page, size).stream()
            .map(UserMapper::toSummary)
            .toList();
    return ResponseEntity.ok(new FollowPageResponse(users, page, size, users.size() == size));
  }

  @GetMapping("/{username}/following")
  @Operation(
      summary = "Lista os usuários que um leitor segue",
      description = "Paginado. Retorna lista vazia para perfis privados sem acesso.")
  public ResponseEntity<FollowPageResponse> getFollowing(
      @PathVariable String username,
      @Parameter(description = "Página (0-based)", example = "0") @RequestParam(defaultValue = "0")
          int page,
      @Parameter(description = "Itens por página", example = "20")
          @RequestParam(defaultValue = "20")
          int size,
      @AuthenticationPrincipal UserDetails principal) {
    ProfileAccess access = userUseCase.getProfile(viewerIdOrNull(principal), username);
    if (access.restricted()) {
      return ResponseEntity.ok(new FollowPageResponse(List.of(), page, size, false));
    }
    List<UserSummaryResponse> users =
        userUseCase.getFollowing(access.user().getId(), page, size).stream()
            .map(UserMapper::toSummary)
            .toList();
    return ResponseEntity.ok(new FollowPageResponse(users, page, size, users.size() == size));
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }

  private Long viewerIdOrNull(UserDetails principal) {
    return principal != null ? currentUserId(principal) : null;
  }

  private static final long MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
  private static final java.util.Set<String> ALLOWED_MIME_TYPES =
      java.util.Set.of("image/jpeg", "image/png", "image/webp");

  private void validateImageFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Arquivo não pode estar vazio");
    }
    if (file.getSize() > MAX_UPLOAD_BYTES) {
      throw new IllegalArgumentException("Arquivo excede o tamanho máximo de 5MB");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
      throw new IllegalArgumentException(
          "Tipo de arquivo inválido. Tipos aceitos: JPEG, PNG, WebP");
    }
  }
}
