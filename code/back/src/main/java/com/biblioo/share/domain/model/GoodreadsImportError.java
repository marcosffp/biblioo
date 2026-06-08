package com.biblioo.share.domain.model;

public record GoodreadsImportError(int rowNumber, String title, String reason) {}
