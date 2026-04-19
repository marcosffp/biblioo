package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.model.*;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import com.biblioo.community.domain.port.out.CommunityUserLookupPort;
import com.biblioo.community.infrastructure.dto.*;
import com.biblioo.community.infrastructure.dto.mapper.CommunityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
@Tag(name = "Communities", description = "Gerenciamento de comunidades de leitores")
public class CommunityController {

  private final CommunityUseCase communityUseCase;
  private final CommunityMapper communityMapper;
  private final CommunityUserLookupPort userLookup;

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @PostMapping
  @Operation(summary = "Criar uma comunidade")
  public ResponseEntity<CommunityResponse> create(
      @AuthenticationPrincipal UserDetails principal,
      @Valid @RequestBody CreateCommunityRequest request) {
    Long userId = currentUserId(principal);
    String safeName = sanitize(request.name());
    String safeDesc = request.description() != null ? sanitize(request.description()) : null;

    Community community =
        communityUseCase.createCommunity(
            userId, safeName, safeDesc, request.type(), request.bookId());

    return ResponseEntity.status(HttpStatus.CREATED).body(communityMapper.toResponse(community));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Detalhes de uma comunidade")
  public ResponseEntity<CommunityDetailResponse> getById(
      @PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
    Long userId = principal != null ? currentUserId(principal) : null;
    Community community = communityUseCase.getCommunityForViewer(userId, id);
    CommunityRole role = communityUseCase.getMemberRole(id, userId).orElse(null);

    return ResponseEntity.ok(communityMapper.toDetailResponse(community, role));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Atualizar nome/descrição da comunidade")
  public ResponseEntity<CommunityResponse> update(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @Valid @RequestBody UpdateCommunityRequest request) {
    Long userId = currentUserId(principal);
    String safeName = request.name() != null ? sanitize(request.name()) : null;
    String safeDesc = request.description() != null ? sanitize(request.description()) : null;

    Community community = communityUseCase.updateCommunity(userId, id, safeName, safeDesc);
    return ResponseEntity.ok(communityMapper.toResponse(community));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Excluir comunidade (soft-delete)")
  public ResponseEntity<Void> delete(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    communityUseCase.deleteCommunity(currentUserId(principal), id);
    return ResponseEntity.noContent().build();
  }

  // ── Listagem / Busca ──────────────────────────────────────────────────────

  @GetMapping
  @Operation(summary = "Listar/buscar comunidades")
  public ResponseEntity<Page<CommunityResponse>> list(
      @RequestParam(required = false) String q,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Page<CommunityResponse> page =
        communityUseCase.listCommunities(q, pageable).map(communityMapper::toResponse);
    return ResponseEntity.ok(page);
  }

  @GetMapping("/mine")
  @Operation(summary = "Minhas comunidades")
  public ResponseEntity<Page<CommunityResponse>> mine(
      @AuthenticationPrincipal UserDetails principal,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Page<CommunityResponse> page =
        communityUseCase
            .getUserCommunities(currentUserId(principal), pageable)
            .map(communityMapper::toResponse);
    return ResponseEntity.ok(page);
  }

  @GetMapping("/book/{bookId}")
  @Operation(summary = "Comunidades de um livro")
  public ResponseEntity<Page<CommunityResponse>> byBook(
      @PathVariable Long bookId, @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Page<CommunityResponse> page =
        communityUseCase.getCommunitiesByBook(bookId, pageable).map(communityMapper::toResponse);
    return ResponseEntity.ok(page);
  }

  // ── Membership ────────────────────────────────────────────────────────────

  @PostMapping("/{id}/join")
  @Operation(summary = "Entrar em uma comunidade pública")
  public ResponseEntity<Void> join(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    communityUseCase.joinCommunity(currentUserId(principal), id);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}/leave")
  @Operation(summary = "Sair de uma comunidade")
  public ResponseEntity<Void> leave(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    communityUseCase.leaveCommunity(currentUserId(principal), id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/members")
  @Operation(summary = "Listar membros de uma comunidade")
  public ResponseEntity<Page<CommunityMemberResponse>> members(
      @PathVariable Long id,
      @AuthenticationPrincipal UserDetails principal,
      @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
    Long userId = principal != null ? currentUserId(principal) : null;
    Page<CommunityMemberResponse> page =
        communityUseCase
            .getMembers(userId, id, pageable)
            .map(
                member -> {
                  CommunityUserSummary user = userLookup.getById(member.getUserId());
                  return new CommunityMemberResponse(
                      member.getUserId(),
                      user != null ? user.username() : null,
                      user != null ? user.avatarUrl() : null,
                      member.getRole(),
                      member.getJoinedAt());
                });
    return ResponseEntity.ok(page);
  }

  // ── Role Management ───────────────────────────────────────────────────────

  @PutMapping("/{id}/members/{userId}/role")
  @Operation(summary = "Alterar papel de um membro")
  public ResponseEntity<Void> changeRole(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @PathVariable Long userId,
      @Valid @RequestBody ChangeRoleRequest request) {
    communityUseCase.changeRole(currentUserId(principal), id, userId, request.role());
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}/members/{userId}")
  @Operation(summary = "Remover um membro")
  public ResponseEntity<Void> removeMember(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @PathVariable Long userId) {
    communityUseCase.removeMember(currentUserId(principal), id, userId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/transfer-ownership")
  @Operation(summary = "Transferir propriedade da comunidade")
  public ResponseEntity<Void> transferOwnership(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @Valid @RequestBody TransferOwnershipRequest request) {
    communityUseCase.transferOwnership(currentUserId(principal), id, request.newOwnerId());
    return ResponseEntity.noContent().build();
  }

  // ── Invite Link ───────────────────────────────────────────────────────────

  @PostMapping("/{id}/invite-link")
  @Operation(summary = "Gerar ou regenerar link de convite")
  public ResponseEntity<java.util.Map<String, String>> generateInviteLink(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    String token = communityUseCase.generateInviteLink(currentUserId(principal), id);
    return ResponseEntity.ok(java.util.Map.of("inviteLink", token));
  }

  @DeleteMapping("/{id}/invite-link")
  @Operation(summary = "Revogar link de convite")
  public ResponseEntity<Void> revokeInviteLink(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    communityUseCase.revokeInviteLink(currentUserId(principal), id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/join/{token}")
  @Operation(summary = "Entrar em uma comunidade via link de convite")
  public ResponseEntity<Void> joinByInviteLink(
      @AuthenticationPrincipal UserDetails principal, @PathVariable String token) {
    communityUseCase.joinByInviteLink(currentUserId(principal), token);
    return ResponseEntity.noContent().build();
  }

  // ── Invites ────────────────────────────────────────────────────────────────

  @PostMapping("/{id}/invites")
  @Operation(summary = "Convidar um usuário para a comunidade")
  public ResponseEntity<Void> invite(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @Valid @RequestBody InviteUserRequest request) {
    communityUseCase.inviteUser(currentUserId(principal), id, request.inviteeId());
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @PostMapping("/invites/{inviteId}/accept")
  @Operation(summary = "Aceitar convite")
  public ResponseEntity<Void> acceptInvite(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long inviteId) {
    communityUseCase.acceptInvite(currentUserId(principal), inviteId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/invites/{inviteId}/decline")
  @Operation(summary = "Recusar convite")
  public ResponseEntity<Void> declineInvite(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long inviteId) {
    communityUseCase.declineInvite(currentUserId(principal), inviteId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/invites/pending")
  @Operation(summary = "Meus convites pendentes")
  public ResponseEntity<Page<CommunityInviteResponse>> pendingInvites(
      @AuthenticationPrincipal UserDetails principal,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Long userId = currentUserId(principal);
    Page<CommunityInviteResponse> page =
        communityUseCase
            .getPendingInvites(userId, pageable)
            .map(
                invite -> {
                  Community community = communityUseCase.getCommunityById(invite.getCommunityId());
                  CommunityUserSummary inviter = userLookup.getById(invite.getInviterId());
                  return new CommunityInviteResponse(
                      invite.getId(),
                      invite.getCommunityId(),
                      community.getName(),
                      invite.getInviterId(),
                      inviter != null ? inviter.username() : null,
                      invite.getStatus(),
                      invite.getCreatedAt());
                });
    return ResponseEntity.ok(page);
  }

  // ── Join Requests ─────────────────────────────────────────────────────────

  @PostMapping("/{id}/join-requests")
  @Operation(summary = "Solicitar entrada em comunidade privada")
  public ResponseEntity<Void> requestToJoin(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
    communityUseCase.requestToJoin(currentUserId(principal), id);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @GetMapping("/{id}/join-requests")
  @Operation(summary = "Listar solicitações pendentes")
  public ResponseEntity<Page<CommunityJoinRequestResponse>> pendingJoinRequests(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long id,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Long actorId = currentUserId(principal);
    Page<CommunityJoinRequestResponse> page =
        communityUseCase
            .getPendingJoinRequests(actorId, id, pageable)
            .map(
                req -> {
                  CommunityUserSummary user = userLookup.getById(req.getUserId());
                  return new CommunityJoinRequestResponse(
                      req.getId(),
                      req.getUserId(),
                      user != null ? user.username() : null,
                      user != null ? user.avatarUrl() : null,
                      req.getStatus(),
                      req.getCreatedAt());
                });
    return ResponseEntity.ok(page);
  }

  @PostMapping("/join-requests/{requestId}/approve")
  @Operation(summary = "Aprovar solicitação de entrada")
  public ResponseEntity<Void> approveJoinRequest(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long requestId) {
    communityUseCase.approveJoinRequest(currentUserId(principal), requestId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/join-requests/{requestId}/reject")
  @Operation(summary = "Rejeitar solicitação de entrada")
  public ResponseEntity<Void> rejectJoinRequest(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long requestId) {
    communityUseCase.rejectJoinRequest(currentUserId(principal), requestId);
    return ResponseEntity.noContent().build();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }

  private String sanitize(String input) {
    return Jsoup.clean(input, Safelist.none()).trim();
  }
}
