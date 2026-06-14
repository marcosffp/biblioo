package com.biblioo.community.domain.service;

import com.biblioo.community.domain.exception.*;
import com.biblioo.community.domain.model.*;
import com.biblioo.community.domain.model.enumeration.CommunityRole;
import com.biblioo.community.domain.model.enumeration.TieBreakRule;
import com.biblioo.community.domain.model.enumeration.VotingStatus;
import com.biblioo.community.domain.port.in.BookVotingUseCase;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import com.biblioo.community.domain.port.out.VotingBroadcastPort;
import com.biblioo.community.infrastructure.dto.community.CommunityBookSummary;
import com.biblioo.community.infrastructure.dto.mapper.BookVotingMapper;
import com.biblioo.community.infrastructure.dto.voting.ApproveVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.CreateVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.RejectVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.VotingEventPayload;
import com.biblioo.community.infrastructure.dto.voting.VotingResponse;
import com.biblioo.community.infrastructure.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
public class BookVotingService implements BookVotingUseCase {

  private final BookVotingRepository votingRepository;
  private final BookVotingOptionRepository optionRepository;
  private final BookVoteRepository voteRepository;
  private final CommunityRepository communityRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityBookLookupPort bookLookup;
  private final BookVotingMapper mapper;
  private final VotingBroadcastPort broadcastPort;

  @Override
  @Transactional
  public VotingResponse createVoting(Long adminId, Long communityId, CreateVotingRequest request) {
    requireOwner(communityId, adminId);

    if (request.endsAt().isBefore(request.startsAt())
        || request.endsAt().isEqual(request.startsAt())) {
      throw new CommunityBusinessException(
          "A data de encerramento deve ser posterior à data de início.");
    }

    BookVoting voting =
        BookVoting.builder()
            .communityId(communityId)
            .title(request.title())
            .status(VotingStatus.DRAFT)
            .tieBreakRule(request.tieBreakRule())
            .startsAt(request.startsAt())
            .endsAt(request.endsAt())
            .createdBy(adminId)
            .build();

    BookVoting savedVoting = votingRepository.save(voting);

    List<BookVotingOption> options =
        request.options().stream()
            .map(
                opt -> {
                  CommunityBookSummary bookSummary = bookLookup.getById(opt.bookId());
                  if (bookSummary == null) {
                    throw new CommunityBusinessException(
                        "Livro não encontrado no catálogo: " + opt.bookId());
                  }
                  return optionRepository.save(
                      BookVotingOption.builder()
                          .votingId(savedVoting.getId())
                          .bookId(bookSummary.id())
                          .bookTitle(bookSummary.title())
                          .bookCoverUrl(bookSummary.coverUrl())
                          .build());
                })
            .toList();

    return mapper.toResponse(savedVoting, options, null);
  }

  @Override
  @Transactional
  public VotingResponse publishVoting(Long adminId, Long communityId, Long votingId) {
    requireOwner(communityId, adminId);

    BookVoting voting = getVotingOrThrow(votingId, communityId);
    if (voting.getStatus() != VotingStatus.DRAFT) {
      throw new VotingNotActiveException("Apenas votações em rascunho podem ser publicadas.");
    }
    if (votingRepository.existsActiveVotingExcluding(communityId, votingId)) {
      throw new VotingAlreadyActiveException("Já existe uma votação ativa nesta comunidade.");
    }

    voting.setStatus(VotingStatus.ACTIVE);
    voting = votingRepository.save(voting);

    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    VotingResponse response = mapper.toResponse(voting, options, null);
    broadcastPort.broadcast(
        communityId, new VotingEventPayload(VotingEventPayload.VOTING_CREATED, response));

    return response;
  }

  @Override
  @Transactional(isolation = Isolation.READ_COMMITTED)
  public VotingResponse castVote(Long userId, Long communityId, Long votingId, Long optionId) {
    if (!memberRepository.isMember(communityId, userId)) {
      throw new CommunityAccessDeniedException("Apenas membros podem votar.");
    }

    BookVoting voting = getVotingOrThrow(votingId, communityId);
    if (voting.getStatus() != VotingStatus.ACTIVE) {
      throw new VotingClosedException("Esta votação não está ativa.");
    }
    if (LocalDateTime.now().isAfter(voting.getEndsAt())) {
      throw new VotingClosedException("O prazo desta votação já encerrou.");
    }

    BookVotingOption option =
        optionRepository
            .findByIdForUpdate(optionId)
            .orElseThrow(() -> new VotingOptionNotFoundException(optionId));

    if (!option.getVotingId().equals(votingId)) {
      throw new VotingOptionNotFoundException(optionId);
    }

    Optional<BookVote> existingVote = voteRepository.findByVotingIdAndUserId(votingId, userId);
    Long myVotedOptionId;

    if (existingVote.isEmpty()) {
      voteRepository.save(
          BookVote.builder()
              .votingId(votingId)
              .optionId(optionId)
              .userId(userId)
              .votedAt(LocalDateTime.now())
              .build());
      option.setVoteCount(option.getVoteCount() + 1);
      optionRepository.save(option);
      myVotedOptionId = optionId;
    } else if (existingVote.get().getOptionId().equals(optionId)) {
      voteRepository.delete(existingVote.get());
      option.setVoteCount(Math.max(0, option.getVoteCount() - 1));
      optionRepository.save(option);
      myVotedOptionId = null;
    } else {
      throw new AlreadyVotedDifferentOptionException(
          "Você já votou em outra opção. Desfaça seu voto primeiro clicando na opção votada.");
    }

    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    VotingResponse broadcast = mapper.toResponse(voting, options, null);
    broadcastPort.broadcast(
        communityId, new VotingEventPayload(VotingEventPayload.VOTE_UPDATED, broadcast));

    return mapper.toResponse(voting, options, myVotedOptionId);
  }

  @Override
  @Transactional
  public VotingResponse closeVoting(Long adminId, Long communityId, Long votingId) {
    requireOwner(communityId, adminId);

    BookVoting voting = getVotingOrThrow(votingId, communityId);
    if (voting.getStatus() != VotingStatus.ACTIVE) {
      throw new VotingNotActiveException("Apenas votações ativas podem ser encerradas.");
    }

    performClose(voting);

    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    VotingResponse response = mapper.toResponse(voting, options, null);
    broadcastPort.broadcast(
        communityId, new VotingEventPayload(VotingEventPayload.VOTING_CLOSED, response));

    return response;
  }

  @Override
  @Transactional
  public VotingResponse approveResult(
      Long adminId, Long communityId, Long votingId, ApproveVotingRequest request) {
    requireOwner(communityId, adminId);

    BookVoting voting = getVotingOrThrow(votingId, communityId);
    if (voting.getStatus() != VotingStatus.CLOSED) {
      throw new VotingNotActiveException(
          "Apenas votações encerradas podem ter resultado aprovado.");
    }

    if (voting.getWinnerOptionId() == null) {
      if (request.winnerOptionId() == null) {
        throw new CommunityBusinessException(
            "Há empate com regra de decisão do proprietário. Informe o ID da opção vencedora.");
      }
      BookVotingOption chosen =
          optionRepository
              .findById(request.winnerOptionId())
              .orElseThrow(() -> new VotingOptionNotFoundException(request.winnerOptionId()));
      if (!chosen.getVotingId().equals(votingId)) {
        throw new VotingOptionNotFoundException(request.winnerOptionId());
      }
      voting.setWinnerOptionId(request.winnerOptionId());
    }

    voting.setStatus(VotingStatus.APPROVED);
    voting = votingRepository.save(voting);

    BookVotingOption winner = optionRepository.findById(voting.getWinnerOptionId()).orElseThrow();
    Community community =
        communityRepository
            .findById(communityId)
            .orElseThrow(() -> new CommunityBusinessException("Comunidade não encontrada."));
    community.setBookId(winner.getBookId());
    communityRepository.save(community);

    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    VotingResponse response = mapper.toResponse(voting, options, null);
    broadcastPort.broadcast(
        communityId, new VotingEventPayload(VotingEventPayload.VOTING_APPROVED, response));

    return response;
  }

  @Override
  @Transactional
  public VotingResponse rejectResult(
      Long adminId, Long communityId, Long votingId, RejectVotingRequest request) {
    requireOwner(communityId, adminId);

    BookVoting voting = getVotingOrThrow(votingId, communityId);
    if (voting.getStatus() != VotingStatus.CLOSED) {
      throw new VotingNotActiveException(
          "Apenas votações encerradas podem ter resultado rejeitado.");
    }

    voting.setStatus(VotingStatus.REJECTED);
    voting.setRejectionReason(request.reason());
    voting = votingRepository.save(voting);

    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    VotingResponse response = mapper.toResponse(voting, options, null);
    broadcastPort.broadcast(
        communityId, new VotingEventPayload(VotingEventPayload.VOTING_REJECTED, response));

    return response;
  }

  @Override
  @Transactional(readOnly = true)
  public VotingResponse getVoting(Long userId, Long communityId, Long votingId) {
    BookVoting voting = getVotingOrThrow(votingId, communityId);
    List<BookVotingOption> options = optionRepository.findByVotingId(votingId);
    Long myVotedOptionId =
        userId != null
            ? voteRepository
                .findByVotingIdAndUserId(votingId, userId)
                .map(BookVote::getOptionId)
                .orElse(null)
            : null;
    return mapper.toResponse(voting, options, myVotedOptionId);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<VotingResponse> listVotings(Long userId, Long communityId, Pageable pageable) {
    return votingRepository
        .findByCommunityIdOrdered(communityId, pageable)
        .map(
            v -> {
              List<BookVotingOption> options = optionRepository.findByVotingId(v.getId());
              Long myVotedOptionId =
                  userId != null
                      ? voteRepository
                          .findByVotingIdAndUserId(v.getId(), userId)
                          .map(BookVote::getOptionId)
                          .orElse(null)
                      : null;
              return mapper.toResponse(v, options, myVotedOptionId);
            });
  }

  @Override
  @Transactional
  public void closeExpiredVotings() {
    List<BookVoting> expired =
        votingRepository.findExpiredActive(VotingStatus.ACTIVE, LocalDateTime.now());
    for (BookVoting voting : expired) {
      performClose(voting);
      List<BookVotingOption> options = optionRepository.findByVotingId(voting.getId());
      VotingResponse response = mapper.toResponse(voting, options, null);
      broadcastPort.broadcast(
          voting.getCommunityId(),
          new VotingEventPayload(VotingEventPayload.VOTING_CLOSED, response));
    }
  }

  private BookVoting getVotingOrThrow(Long votingId, Long communityId) {
    return votingRepository
        .findByIdAndCommunityId(votingId, communityId)
        .orElseThrow(() -> new VotingNotFoundException(votingId));
  }

  private void requireOwner(Long communityId, Long userId) {
    CommunityRole role =
        memberRepository
            .findRole(communityId, userId)
            .orElseThrow(
                () -> new CommunityAccessDeniedException("Você não é membro desta comunidade."));
    if (role != CommunityRole.OWNER) {
      throw new CommunityAccessDeniedException("Apenas o proprietário pode gerenciar votações.");
    }
  }

  private void performClose(BookVoting voting) {
    voting.setStatus(VotingStatus.CLOSED);
    voting.setClosedAt(LocalDateTime.now());

    List<BookVotingOption> options = optionRepository.findByVotingId(voting.getId());
    int maxVotes = options.stream().mapToInt(BookVotingOption::getVoteCount).max().orElse(0);
    List<BookVotingOption> leaders =
        options.stream().filter(o -> o.getVoteCount() == maxVotes).toList();

    if (leaders.size() == 1) {
      voting.setWinnerOptionId(leaders.get(0).getId());
    } else if (voting.getTieBreakRule() == TieBreakRule.RANDOM_DRAW) {
      int idx = ThreadLocalRandom.current().nextInt(leaders.size());
      voting.setWinnerOptionId(leaders.get(idx).getId());
    }

    votingRepository.save(voting);
  }
}
