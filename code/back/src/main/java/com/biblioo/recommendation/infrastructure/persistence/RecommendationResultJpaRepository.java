package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.model.RecommendationResult;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationResultJpaRepository
    extends JpaRepository<RecommendationResult, Long> {

  Optional<RecommendationResult> findByUserIdAndTrailType(Long userId, String trailType);
}
