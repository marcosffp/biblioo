package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.User;
import java.util.List;

public interface UserSearchPort {

  List<User> search(String term, int page, int size);

  void index(User user);

  void deleteFromIndex(Long userId);
}
