package com.biblioo.community.domain.model;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMemberId implements Serializable {
  private Long communityId;
  private Long userId;
}
