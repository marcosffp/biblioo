package com.biblioo.user.domain.port.in;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import java.util.List;

public interface UserUseCase {

  User getById(Long id);

  User getByUsername(String username);


  ProfileAccess getProfile(Long viewerId, String username);

  User updateProfile(Long userId, String username, String bio, String avatarUrl, String bannerUrl);

  User updateVisibility(Long userId, boolean isPrivate);

  User uploadAvatar(Long userId, byte[] imageBytes);

  User uploadBanner(Long userId, byte[] imageBytes);


  FollowStatus follow(Long followerId, Long followedId);

  void unfollow(Long followerId, Long followedId);

  boolean isFollowing(Long followerId, Long followedId);

  void acceptFollowRequest(Long userId, Long requesterId);

  void rejectFollowRequest(Long userId, Long requesterId);

  List<User> getPendingFollowRequests(Long userId, int page, int size);

  void deleteAccount(Long userId);

  List<User> getFollowers(Long userId, int page, int size);

  List<User> getFollowing(Long userId, int page, int size);

  List<User> searchUsers(String term, int page, int size);
}
