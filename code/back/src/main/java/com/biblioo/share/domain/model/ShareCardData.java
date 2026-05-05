package com.biblioo.share.domain.model;

import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.user.domain.model.User;
import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;

public record ShareCardData(
    User user,
    LiteraryDna dna,
    List<BufferedImage> covers,
    List<DisplayBook> displayBooks,
    List<Map<String, Object>> themes,
    int totalPages) {

  public record DisplayBook(Long bookId, String title) {}
}
