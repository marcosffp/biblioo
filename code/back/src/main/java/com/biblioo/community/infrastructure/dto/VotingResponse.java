package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.TieBreakRule;
import com.biblioo.community.domain.model.VotingStatus;
import java.time.LocalDateTime;
import java.util.List;

public record VotingResponse(
    Long id,
    Long communityId,
    String title,
    VotingStatus status,
    TieBreakRule tieBreakRule,
    LocalDateTime startsAt,
    LocalDateTime endsAt,
    LocalDateTime closedAt,
    Long winnerOptionId,
    String rejectionReason,
    Long createdBy,
    LocalDateTime createdAt,
    List<VotingOptionResponse> options,
    Long myVotedOptionId) {}
