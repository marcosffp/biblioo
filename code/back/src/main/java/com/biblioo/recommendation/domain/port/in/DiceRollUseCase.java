package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.DiceRollResult;

public interface DiceRollUseCase {

  DiceRollResult rollDice(Long userId);
}
