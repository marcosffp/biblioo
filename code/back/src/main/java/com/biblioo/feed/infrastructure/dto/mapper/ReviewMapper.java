package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.infrastructure.dto.review.ReviewBasicResponse;
import com.biblioo.feed.infrastructure.dto.review.ReviewResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

  ReviewResponse toResponse(Review review);

  ReviewBasicResponse toBasicResponse(Review review);
}
