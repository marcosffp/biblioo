package com.biblioo.community.domain.port.in;

import com.biblioo.community.infrastructure.dto.ApproveVotingRequest;
import com.biblioo.community.infrastructure.dto.CreateVotingRequest;
import com.biblioo.community.infrastructure.dto.RejectVotingRequest;
import com.biblioo.community.infrastructure.dto.VotingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookVotingUseCase {

  VotingResponse createVoting(Long adminId, Long communityId, CreateVotingRequest request);

  VotingResponse publishVoting(Long adminId, Long communityId, Long votingId);

  VotingResponse castVote(Long userId, Long communityId, Long votingId, Long optionId);

  VotingResponse closeVoting(Long adminId, Long communityId, Long votingId);

  VotingResponse approveResult(
      Long adminId, Long communityId, Long votingId, ApproveVotingRequest request);

  VotingResponse rejectResult(
      Long adminId, Long communityId, Long votingId, RejectVotingRequest request);

  VotingResponse getVoting(Long userId, Long communityId, Long votingId);

  Page<VotingResponse> listVotings(Long userId, Long communityId, Pageable pageable);

  void closeExpiredVotings();
}
