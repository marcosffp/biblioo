package com.biblioo.community.infrastructure.dto;

public record VotingOptionResponse(
    Long id, Long bookId, String bookTitle, String bookCoverUrl, int voteCount) {}
