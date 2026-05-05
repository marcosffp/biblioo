package com.biblioo.share.domain.port.in;

public interface ShareCardUseCase {
  byte[] generateDnaCard(Long userId);
}
