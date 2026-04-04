package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.infrastructure.dto.review.ReviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

  @Mapping(target = "bookId", source = "book.id")
  ReviewResponse toResponse(Review review);
}
