package com.biblioo.community.domain.service;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;
import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.model.*;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import com.biblioo.community.domain.port.out.CommunityEventPublisherPort;
import com.biblioo.community.domain.port.out.CommunityUserLookupPort;
import com.biblioo.community.infrastructure.persistence.CommunityInviteRepository;
import com.biblioo.community.infrastructure.persistence.CommunityJoinRequestRepository;
import com.biblioo.community.infrastructure.persistence.CommunityMemberRepository;
import com.biblioo.community.infrastructure.persistence.CommunityMembershipCache;
import com.biblioo.community.infrastructure.persistence.CommunityPostRepository;
import com.biblioo.community.infrastructure.persistence.CommunityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
public class CommunityService implements CommunityUseCase {

  private final CommunityRepository communityRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityMembershipCache membershipCache;
  private final CommunityInviteRepository inviteRepository;
  private final CommunityJoinRequestRepository joinRequestRepository;
  private final CommunityPostRepository postRepository;
  private final CommunityUserLookupPort userLookup;
  private final CommunityBookLookupPort bookLookup;
  private final CommunityEventPublisherPort eventPublisher;

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public Community createCommunity(
      Long userId, String name, String description, CommunityType type, Long bookId) {
    if (!userLookup.existsById(userId)) {
      throw new CommunityBusinessException("Usuário não encontrado.");
    }
    if (!bookLookup.existsById(bookId)) {
      throw new CommunityBusinessException("Livro não encontrado.");
    }

    Community community =
        Community.builder()
            .name(name)
            .description(description)
            .type(type)
            .bookId(bookId)
            .ownerId(userId)
            .build();

    community = communityRepository.save(community);

    CommunityMember ownerMember =
        CommunityMember.builder()
            .communityId(community.getId())
            .userId(userId)
            .role(CommunityRole.OWNER)
            .build();

    memberRepository.save(ownerMember);
    return community;
  }

  @Override
  @Transactional
  public Community updateCommunity(Long userId, Long communityId, String name, String description) {
    Community community = getActiveCommunity(communityId);
    requireRole(communityId, userId, CommunityRole.OWNER, "Apenas o proprietário pode editar.");

    if (name != null && !name.isBlank()) {
      community.setName(name);
    }
    if (description != null) {
      community.setDescription(description);
    }
    return communityRepository.save(community);
  }

  @Override
  @Transactional
  public void deleteCommunity(Long userId, Long communityId) {
    getActiveCommunity(communityId);
    requireRole(communityId, userId, CommunityRole.OWNER, "Apenas o proprietário pode excluir.");

    postRepository.softDeleteAllByCommunityId(communityId);
    memberRepository.deleteAllByCommunityId(communityId);
    inviteRepository.deleteAllByCommunityId(communityId);
    joinRequestRepository.deleteAllByCommunityId(communityId);
    communityRepository.softDelete(communityId);
  }

  @Override
  public Community getCommunityById(Long communityId) {
    return getActiveCommunity(communityId);
  }

  @Override
  public Community getCommunityForViewer(Long userId, Long communityId) {
    Community community = getActiveCommunity(communityId);
    if (community.getType() == CommunityType.PRIVATE
        && (userId == null || !memberRepository.isMember(communityId, userId))) {
      throw new CommunityAccessDeniedException("Comunidade privada. Acesso restrito a membros.");
    }
    return community;
  }

  @Override
  public Page<Community> listCommunities(String query, Pageable pageable) {
    if (query != null && !query.isBlank()) {
      return communityRepository.searchByName(query.trim(), pageable);
    }
    return communityRepository.findAllActive(pageable);
  }

  @Override
  public Page<Community> getCommunitiesByBook(Long bookId, Pageable pageable) {
    return communityRepository.findByBookId(bookId, pageable);
  }

  @Override
  public Page<Community> getUserCommunities(Long userId, Pageable pageable) {
    return communityRepository.findByMemberUserId(userId, pageable);
  }

  // ── Membership ────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public void joinCommunity(Long userId, Long communityId) {
    Community community = getActiveCommunity(communityId);

    if (memberRepository.isMember(communityId, userId)) {
      throw new CommunityBusinessException("Usuário já é membro desta comunidade.");
    }

    if (community.getType() == CommunityType.PRIVATE) {
      throw new CommunityBusinessException(
          "Comunidade privada. Solicite acesso ou aceite um convite.");
    }

    addMember(communityId, userId, CommunityRole.MEMBER);
  }

  @Override
  @Transactional
  public void leaveCommunity(Long userId, Long communityId) {
    getActiveCommunity(communityId);

    CommunityRole role =
        memberRepository
            .findRole(communityId, userId)
            .orElseThrow(
                () -> new CommunityBusinessException("Usuário não é membro desta comunidade."));

    if (role == CommunityRole.OWNER) {
      throw new CommunityBusinessException(
          "O proprietário não pode sair da comunidade. Transfira a propriedade primeiro.");
    }

    memberRepository.removeMember(communityId, userId);
    communityRepository.decrementMemberCount(communityId);
    membershipCache.evict(communityId, userId);
  }

  @Override
  public Page<CommunityMember> getMembers(Long userId, Long communityId, Pageable pageable) {
    getCommunityForViewer(userId, communityId);
    return memberRepository.findByCommunityId(communityId, pageable);
  }

  @Override
  @Transactional
  public void changeRole(Long actorId, Long communityId, Long targetUserId, CommunityRole newRole) {
    getActiveCommunity(communityId);
    requireRole(
        communityId, actorId, CommunityRole.OWNER, "Apenas o proprietário pode alterar papéis.");

    if (newRole == CommunityRole.OWNER) {
      throw new CommunityBusinessException("Use o endpoint de transferência de propriedade.");
    }

    CommunityRole targetCurrentRole =
        memberRepository
            .findRole(communityId, targetUserId)
            .orElseThrow(
                () ->
                    new CommunityBusinessException("Usuário alvo não é membro desta comunidade."));

    if (targetCurrentRole == CommunityRole.OWNER) {
      throw new CommunityBusinessException("Não é possível alterar o papel do proprietário.");
    }

    memberRepository.updateRole(communityId, targetUserId, newRole);
  }

  @Override
  @Transactional
  public void removeMember(Long actorId, Long communityId, Long targetUserId) {
    getActiveCommunity(communityId);

    CommunityRole actorRole =
        memberRepository
            .findRole(communityId, actorId)
            .orElseThrow(
                () -> new CommunityAccessDeniedException("Você não é membro desta comunidade."));

    if (actorRole == CommunityRole.MEMBER) {
      throw new CommunityAccessDeniedException(
          "Apenas proprietários e moderadores podem remover membros.");
    }

    CommunityRole targetRole =
        memberRepository
            .findRole(communityId, targetUserId)
            .orElseThrow(
                () ->
                    new CommunityBusinessException("Usuário alvo não é membro desta comunidade."));

    if (targetRole == CommunityRole.OWNER) {
      throw new CommunityBusinessException("Não é possível remover o proprietário.");
    }

    if (actorRole == CommunityRole.MODERATOR && targetRole == CommunityRole.MODERATOR) {
      throw new CommunityAccessDeniedException("Moderadores não podem remover outros moderadores.");
    }

    memberRepository.removeMember(communityId, targetUserId);
    communityRepository.decrementMemberCount(communityId);
    membershipCache.evict(communityId, targetUserId);
  }

  @Override
  @Transactional
  public void transferOwnership(Long ownerId, Long communityId, Long newOwnerId) {
    Community community = getActiveCommunity(communityId);
    requireRole(
        communityId,
        ownerId,
        CommunityRole.OWNER,
        "Apenas o proprietário pode transferir a propriedade.");

    if (ownerId.equals(newOwnerId)) {
      throw new CommunityBusinessException("Você já é o proprietário.");
    }

    if (!memberRepository.isMember(communityId, newOwnerId)) {
      throw new CommunityBusinessException("O novo proprietário deve ser membro da comunidade.");
    }

    memberRepository.updateRole(communityId, ownerId, CommunityRole.MODERATOR);
    memberRepository.updateRole(communityId, newOwnerId, CommunityRole.OWNER);
    community.setOwnerId(newOwnerId);
    communityRepository.save(community);
  }

  @Override
  public boolean isMember(Long communityId, Long userId) {
    return memberRepository.isMember(communityId, userId);
  }

  @Override
  public Optional<CommunityRole> getMemberRole(Long communityId, Long userId) {
    if (userId == null) return Optional.empty();
    return memberRepository.findRole(communityId, userId);
  }

  // ── Invites ───────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public CommunityInvite inviteUser(Long inviterId, Long communityId, Long inviteeId) {
    Community community = getActiveCommunity(communityId);

    if (inviterId.equals(inviteeId)) {
      throw new CommunityBusinessException("Não é possível convidar a si mesmo.");
    }

    if (!memberRepository.isMember(communityId, inviterId)) {
      throw new CommunityAccessDeniedException("Apenas membros podem convidar outros usuários.");
    }

    if (community.getType() == CommunityType.PRIVATE) {
      CommunityRole role =
          memberRepository
              .findRole(communityId, inviterId)
              .orElseThrow(() -> new CommunityAccessDeniedException("Acesso negado."));
      if (role == CommunityRole.MEMBER) {
        throw new CommunityAccessDeniedException(
            "Em comunidades privadas, apenas o dono e moderadores podem convidar.");
      }
    }

    if (!userLookup.existsById(inviteeId)) {
      throw new CommunityBusinessException("Usuário convidado não encontrado.");
    }

    if (memberRepository.isMember(communityId, inviteeId)) {
      throw new CommunityBusinessException("Usuário já é membro desta comunidade.");
    }

    if (inviteRepository.existsPending(communityId, inviteeId, InviteStatus.PENDING)) {
      throw new CommunityBusinessException("Já existe um convite pendente para este usuário.");
    }

    CommunityInvite invite =
        CommunityInvite.builder()
            .communityId(communityId)
            .inviterId(inviterId)
            .inviteeId(inviteeId)
            .build();

    invite = inviteRepository.save(invite);

    CommunityUserSummary inviter = userLookup.getById(inviterId);
    eventPublisher.publishInviteSent(
        communityId,
        community.getName(),
        inviterId,
        inviter != null ? inviter.username() : null,
        inviter != null ? inviter.avatarUrl() : null,
        inviteeId);

    return invite;
  }

  @Override
  @Transactional
  public void acceptInvite(Long userId, Long inviteId) {
    CommunityInvite invite =
        inviteRepository
            .findById(inviteId)
            .orElseThrow(() -> new CommunityBusinessException("Convite não encontrado."));

    if (!invite.getInviteeId().equals(userId)) {
      throw new CommunityAccessDeniedException("Você não pode aceitar este convite.");
    }

    if (invite.getStatus() != InviteStatus.PENDING) {
      throw new CommunityBusinessException("Este convite já foi processado.");
    }

    getActiveCommunity(invite.getCommunityId());

    if (memberRepository.isMember(invite.getCommunityId(), userId)) {
      throw new CommunityBusinessException("Você já é membro desta comunidade.");
    }

    invite.setStatus(InviteStatus.ACCEPTED);
    inviteRepository.save(invite);

    addMember(invite.getCommunityId(), userId, CommunityRole.MEMBER);
  }

  @Override
  @Transactional
  public void declineInvite(Long userId, Long inviteId) {
    CommunityInvite invite =
        inviteRepository
            .findById(inviteId)
            .orElseThrow(() -> new CommunityBusinessException("Convite não encontrado."));

    if (!invite.getInviteeId().equals(userId)) {
      throw new CommunityAccessDeniedException("Você não pode recusar este convite.");
    }

    if (invite.getStatus() != InviteStatus.PENDING) {
      throw new CommunityBusinessException("Este convite já foi processado.");
    }

    invite.setStatus(InviteStatus.DECLINED);
    inviteRepository.save(invite);
  }

  @Override
  public Page<CommunityInvite> getPendingInvites(Long userId, Pageable pageable) {
    return inviteRepository.findPendingByInviteeId(userId, pageable);
  }

  // ── Join Requests ─────────────────────────────────────────────────────────

  @Override
  @Transactional
  public CommunityJoinRequest requestToJoin(Long userId, Long communityId) {
    Community community = getActiveCommunity(communityId);

    if (community.getType() != CommunityType.PRIVATE) {
      throw new CommunityBusinessException(
          "Comunidades públicas não requerem solicitação. Use o endpoint de join.");
    }

    if (memberRepository.isMember(communityId, userId)) {
      throw new CommunityBusinessException("Você já é membro desta comunidade.");
    }

    if (joinRequestRepository.existsPending(communityId, userId, JoinRequestStatus.PENDING)) {
      throw new CommunityBusinessException("Já existe uma solicitação pendente.");
    }

    // Check if user has a pending invite — suggest accepting it instead
    if (inviteRepository.existsPending(communityId, userId, InviteStatus.PENDING)) {
      throw new CommunityBusinessException(
          "Você já possui um convite pendente para esta comunidade. Aceite o convite.");
    }

    CommunityJoinRequest request =
        CommunityJoinRequest.builder().communityId(communityId).userId(userId).build();

    request = joinRequestRepository.save(request);

    List<Long> ownerAndMods =
        memberRepository.findUserIdsByCommunityIdAndRoleIn(
            communityId, List.of(CommunityRole.OWNER, CommunityRole.MODERATOR));
    CommunityUserSummary requester = userLookup.getById(userId);
    eventPublisher.publishJoinRequestCreated(
        communityId,
        community.getName(),
        userId,
        requester != null ? requester.username() : null,
        requester != null ? requester.avatarUrl() : null,
        ownerAndMods);

    return request;
  }

  @Override
  @Transactional
  public void approveJoinRequest(Long actorId, Long requestId) {
    CommunityJoinRequest request =
        joinRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new CommunityBusinessException("Solicitação não encontrada."));

    if (request.getStatus() != JoinRequestStatus.PENDING) {
      throw new CommunityBusinessException("Esta solicitação já foi processada.");
    }

    Community community = getActiveCommunity(request.getCommunityId());
    requireOwnerOrMod(request.getCommunityId(), actorId);

    request.setStatus(JoinRequestStatus.APPROVED);
    request.setReviewedBy(actorId);
    request.setReviewedAt(LocalDateTime.now());
    joinRequestRepository.save(request);

    addMember(request.getCommunityId(), request.getUserId(), CommunityRole.MEMBER);

    eventPublisher.publishJoinRequestApproved(
        request.getCommunityId(), community.getName(), request.getUserId());
  }

  @Override
  @Transactional
  public void rejectJoinRequest(Long actorId, Long requestId) {
    CommunityJoinRequest request =
        joinRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new CommunityBusinessException("Solicitação não encontrada."));

    if (request.getStatus() != JoinRequestStatus.PENDING) {
      throw new CommunityBusinessException("Esta solicitação já foi processada.");
    }

    requireOwnerOrMod(request.getCommunityId(), actorId);

    request.setStatus(JoinRequestStatus.REJECTED);
    request.setReviewedBy(actorId);
    request.setReviewedAt(LocalDateTime.now());
    joinRequestRepository.save(request);
  }

  @Override
  public Page<CommunityJoinRequest> getPendingJoinRequests(
      Long actorId, Long communityId, Pageable pageable) {
    getActiveCommunity(communityId);
    requireOwnerOrMod(communityId, actorId);
    return joinRequestRepository.findPendingByCommunityId(communityId, pageable);
  }

  // ── Invite Link ───────────────────────────────────────────────────────────

  @Override
  @Transactional
  public String generateInviteLink(Long actorId, Long communityId) {
    Community community = getActiveCommunity(communityId);

    CommunityRole role =
        memberRepository
            .findRole(communityId, actorId)
            .orElseThrow(
                () -> new CommunityAccessDeniedException("Apenas membros podem gerar o link."));

    if (community.getType() == CommunityType.PRIVATE && role == CommunityRole.MEMBER) {
      throw new CommunityAccessDeniedException(
          "Em comunidades privadas, apenas o dono e moderadores podem gerar o link.");
    }

    String token = UUID.randomUUID().toString();
    community.setInviteLink(token);
    communityRepository.save(community);
    return token;
  }

  @Override
  @Transactional
  public void revokeInviteLink(Long actorId, Long communityId) {
    Community community = getActiveCommunity(communityId);
    requireOwnerOrMod(communityId, actorId);
    community.setInviteLink(null);
    communityRepository.save(community);
  }

  @Override
  @Transactional
  public void joinByInviteLink(Long userId, String token) {
    Community community =
        communityRepository
            .findActiveByInviteLink(token)
            .orElseThrow(() -> new CommunityBusinessException("Link inválido ou expirado."));

    if (memberRepository.isMember(community.getId(), userId)) {
      throw new CommunityBusinessException("Você já é membro desta comunidade.");
    }

    addMember(community.getId(), userId, CommunityRole.MEMBER);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  void addMember(Long communityId, Long userId, CommunityRole role) {
    CommunityMember member =
        CommunityMember.builder().communityId(communityId).userId(userId).role(role).build();
    memberRepository.save(member);
    communityRepository.incrementMemberCount(communityId);
    membershipCache.evict(communityId, userId);
  }

  Community getActiveCommunity(Long communityId) {
    return communityRepository
        .findActiveById(communityId)
        .orElseThrow(() -> new CommunityBusinessException("Comunidade não encontrada."));
  }

  private void requireRole(Long communityId, Long userId, CommunityRole required, String message) {
    CommunityRole role =
        memberRepository
            .findRole(communityId, userId)
            .orElseThrow(() -> new CommunityAccessDeniedException(message));

    if (role != required) {
      throw new CommunityAccessDeniedException(message);
    }
  }

  private void requireOwnerOrMod(Long communityId, Long userId) {
    CommunityRole role =
        memberRepository
            .findRole(communityId, userId)
            .orElseThrow(
                () ->
                    new CommunityAccessDeniedException(
                        "Apenas proprietários e moderadores podem gerenciar solicitações."));

    if (role == CommunityRole.MEMBER) {
      throw new CommunityAccessDeniedException(
          "Apenas proprietários e moderadores podem gerenciar solicitações.");
    }
  }
}
