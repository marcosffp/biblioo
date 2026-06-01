package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.UserDnaProfile;

public interface AssistantDnaPort {

  UserDnaProfile getProfile(Long userId);
}
