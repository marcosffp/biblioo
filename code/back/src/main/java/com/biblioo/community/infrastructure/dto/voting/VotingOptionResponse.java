package com.biblioo.community.infrastructure.dto.voting;

public record VotingOptionResponse(
    Long id, Long bookId, String bookTitle, String bookCoverUrl, int voteCount) {}
