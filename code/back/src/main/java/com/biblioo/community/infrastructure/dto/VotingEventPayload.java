package com.biblioo.community.infrastructure.dto;

public record VotingEventPayload(String eventType, VotingResponse data) {

  public static final String VOTING_CREATED = "VOTING_CREATED";
  public static final String VOTE_UPDATED = "VOTE_UPDATED";
  public static final String VOTING_CLOSED = "VOTING_CLOSED";
  public static final String VOTING_APPROVED = "VOTING_APPROVED";
  public static final String VOTING_REJECTED = "VOTING_REJECTED";
}
