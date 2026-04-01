package com.biblioo.user.domain.model;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFollowId implements Serializable {
  private Long followerId;
  private Long followedId;
}
