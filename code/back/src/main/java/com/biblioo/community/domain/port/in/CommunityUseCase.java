package com.biblioo.community.domain.port.in;

import com.biblioo.community.domain.model.*;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommunityUseCase {

  Community createCommunity(
      Long userId, String name, String description, CommunityType type, Long bookId);

  Community updateCommunity(Long userId, Long communityId, String name, String description);

  void deleteCommunity(Long userId, Long communityId);

  Community getCommunityById(Long communityId);

  Community getCommunityForViewer(Long userId, Long communityId);

  Page<Community> listCommunities(String query, Pageable pageable);

  Page<Community> getCommunitiesByBook(Long bookId, Pageable pageable);

  Page<Community> getUserCommunities(Long userId, Pageable pageable);

  void joinCommunity(Long userId, Long communityId);

  void leaveCommunity(Long userId, Long communityId);

  Page<CommunityMember> getMembers(Long userId, Long communityId, Pageable pageable);

  void changeRole(Long actorId, Long communityId, Long targetUserId, CommunityRole newRole);

  void removeMember(Long actorId, Long communityId, Long targetUserId);

  void transferOwnership(Long ownerId, Long communityId, Long newOwnerId);

  boolean isMember(Long communityId, Long userId);

  Optional<CommunityRole> getMemberRole(Long communityId, Long userId);

  // ── Invite Link ──────────────────────────────────────────────────────────

  String generateInviteLink(Long actorId, Long communityId);

  void revokeInviteLink(Long actorId, Long communityId);

  void joinByInviteLink(Long userId, String token);

  // ── Invites ─────────────────────────────────────────────────────────────

  CommunityInvite inviteUser(Long inviterId, Long communityId, Long inviteeId);

  void acceptInvite(Long userId, Long inviteId);

  void declineInvite(Long userId, Long inviteId);

  Page<CommunityInvite> getPendingInvites(Long userId, Pageable pageable);

  // ── Join Requests (private communities) ─────────────────────────────────

  CommunityJoinRequest requestToJoin(Long userId, Long communityId);

  void approveJoinRequest(Long actorId, Long requestId);

  void rejectJoinRequest(Long actorId, Long requestId);

  Page<CommunityJoinRequest> getPendingJoinRequests(
      Long actorId, Long communityId, Pageable pageable);
}
