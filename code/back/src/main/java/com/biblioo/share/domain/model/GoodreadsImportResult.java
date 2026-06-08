package com.biblioo.share.domain.model;

import java.util.List;

public record GoodreadsImportResult(
    int totalRows,
    int imported,
    int skipped,
    int failed,
    int reviewsImported,
    List<GoodreadsImportError> errors) {}
