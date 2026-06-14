package com.biblioo.community.infrastructure.dto.mapper;

import com.biblioo.community.domain.model.BookVoting;
import com.biblioo.community.domain.model.BookVotingOption;
import com.biblioo.community.infrastructure.dto.voting.VotingOptionResponse;
import com.biblioo.community.infrastructure.dto.voting.VotingResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookVotingMapper {

  VotingOptionResponse toOptionResponse(BookVotingOption option);

  default List<VotingOptionResponse> toOptionResponses(List<BookVotingOption> options) {
    return options.stream().map(this::toOptionResponse).toList();
  }

  default VotingResponse toResponse(
      BookVoting voting, List<BookVotingOption> options, Long myVotedOptionId) {
    return new VotingResponse(
        voting.getId(),
        voting.getCommunityId(),
        voting.getTitle(),
        voting.getStatus(),
        voting.getTieBreakRule(),
        voting.getStartsAt(),
        voting.getEndsAt(),
        voting.getClosedAt(),
        voting.getWinnerOptionId(),
        voting.getRejectionReason(),
        voting.getCreatedBy(),
        voting.getCreatedAt(),
        toOptionResponses(options),
        myVotedOptionId);
  }
}
