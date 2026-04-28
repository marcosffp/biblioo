package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.GoogleUserInfo;

public interface GoogleAuthPort {
  GoogleUserInfo verify(String idToken);
}
