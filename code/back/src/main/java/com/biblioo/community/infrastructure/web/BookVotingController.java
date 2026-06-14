package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.port.in.BookVotingUseCase;
import com.biblioo.community.infrastructure.dto.voting.ApproveVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.CastVoteRequest;
import com.biblioo.community.infrastructure.dto.voting.CreateVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.RejectVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.VotingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/communities/{communityId}/votings")
@RequiredArgsConstructor
@Tag(name = "Book Votings", description = "Votação democrática do próximo livro da comunidade")
public class BookVotingController {

  private final BookVotingUseCase bookVotingUseCase;

  @PostMapping
  @Operation(summary = "Criar votação (rascunho) — apenas proprietário")
  public ResponseEntity<VotingResponse> create(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @Valid @RequestBody CreateVotingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(bookVotingUseCase.createVoting(currentUserId(principal), communityId, request));
  }

  @PostMapping("/{votingId}/publish")
  @Operation(summary = "Publicar votação — apenas proprietário")
  public ResponseEntity<VotingResponse> publish(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId) {
    return ResponseEntity.ok(
        bookVotingUseCase.publishVoting(currentUserId(principal), communityId, votingId));
  }

  @PostMapping("/{votingId}/vote")
  @Operation(summary = "Votar / desfazer voto — apenas membros")
  public ResponseEntity<VotingResponse> vote(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId,
      @Valid @RequestBody CastVoteRequest request) {
    return ResponseEntity.ok(
        bookVotingUseCase.castVote(
            currentUserId(principal), communityId, votingId, request.optionId()));
  }

  @PostMapping("/{votingId}/close")
  @Operation(summary = "Encerrar votação antecipadamente — apenas proprietário")
  public ResponseEntity<VotingResponse> close(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId) {
    return ResponseEntity.ok(
        bookVotingUseCase.closeVoting(currentUserId(principal), communityId, votingId));
  }

  @PostMapping("/{votingId}/approve")
  @Operation(summary = "Aprovar resultado — apenas proprietário")
  public ResponseEntity<VotingResponse> approve(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId,
      @RequestBody(required = false) ApproveVotingRequest request) {
    ApproveVotingRequest req = request != null ? request : new ApproveVotingRequest(null);
    return ResponseEntity.ok(
        bookVotingUseCase.approveResult(currentUserId(principal), communityId, votingId, req));
  }

  @PostMapping("/{votingId}/reject")
  @Operation(summary = "Rejeitar resultado — apenas proprietário")
  public ResponseEntity<VotingResponse> reject(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId,
      @Valid @RequestBody RejectVotingRequest request) {
    return ResponseEntity.ok(
        bookVotingUseCase.rejectResult(currentUserId(principal), communityId, votingId, request));
  }

  @GetMapping("/{votingId}")
  @Operation(summary = "Detalhes de uma votação")
  public ResponseEntity<VotingResponse> getById(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @PathVariable Long votingId) {
    Long userId = principal != null ? currentUserId(principal) : null;
    return ResponseEntity.ok(bookVotingUseCase.getVoting(userId, communityId, votingId));
  }

  @GetMapping
  @Operation(summary = "Listar votações da comunidade")
  public ResponseEntity<Page<VotingResponse>> list(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long communityId,
      @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
    Long userId = principal != null ? currentUserId(principal) : null;
    return ResponseEntity.ok(bookVotingUseCase.listVotings(userId, communityId, pageable));
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
