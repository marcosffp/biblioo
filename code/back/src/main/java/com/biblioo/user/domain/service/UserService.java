package com.biblioo.user.domain.service;

import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.FollowRequestAlreadySentException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.UserSearchPort;
import com.biblioo.user.infrastructure.persistence.RefreshTokenRepository;
import com.biblioo.user.infrastructure.persistence.UserFollowRepository;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.util.List;
import java.util.Optional;

public class UserService implements UserUseCase {

  private final UserRepository userRepo;
  private final UserFollowRepository followRepo;
  private final ProfileImagePort profileImagePort;
  private final RefreshTokenRepository tokenRepo;
  private final UserSearchPort searchPort;

  public UserService(
      UserRepository userRepo,
      UserFollowRepository followRepo,
      ProfileImagePort profileImagePort,
      RefreshTokenRepository tokenRepo,
      UserSearchPort searchPort) {
    this.userRepo = userRepo;
    this.followRepo = followRepo;
    this.profileImagePort = profileImagePort;
    this.tokenRepo = tokenRepo;
    this.searchPort = searchPort;
  }

  @Override
  public User getById(Long id) {
    return userRepo.findById(id).orElseThrow(() -> new UserNotFoundException(id));
  }

  @Override
  public User getByUsername(String username) {
    return userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(username));
  }

  @Override
  public ProfileAccess getProfile(Long viewerId, String username) {
    User target =
        userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(username));

    if (!target.isPrivate()) {
      return new ProfileAccess(target, false);
    }

    boolean allowed =
        viewerId != null
            && (viewerId.equals(target.getId())
                || followRepo.isFollowing(viewerId, target.getId()));

    return new ProfileAccess(target, !allowed);
  }

  @Override
  public User updateProfile(Long userId, String bio, String avatarUrl, String bannerUrl) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    if (bio != null) user.setBio(bio);
    if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
    if (bannerUrl != null) user.setBannerUrl(bannerUrl);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
  }

  @Override
  public User updateVisibility(Long userId, boolean isPrivate) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setPrivate(isPrivate);
    return userRepo.save(user);
  }

  @Override
  public User uploadAvatar(Long userId, byte[] imageBytes) {
    String url = profileImagePort.uploadProfileImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setAvatarUrl(url);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
  }

  @Override
  public User uploadBanner(Long userId, byte[] imageBytes) {
    String url = profileImagePort.uploadBannerImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setBannerUrl(url);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
  }

  @Override
  public FollowStatus follow(Long followerId, Long followedId) {
    if (followerId.equals(followedId)) {
      throw new IllegalArgumentException("Você não pode seguir a si mesmo");
    }
    User target =
        userRepo.findById(followedId).orElseThrow(() -> new UserNotFoundException(followedId));

    Optional<FollowStatus> existing = followRepo.findFollowStatus(followerId, followedId);
    if (existing.isPresent()) {
      if (existing.get() == FollowStatus.ACCEPTED) {
        throw new AlreadyFollowingException();
      } else {
        throw new FollowRequestAlreadySentException();
      }
    }

    FollowStatus status = target.isPrivate() ? FollowStatus.PENDING : FollowStatus.ACCEPTED;
    followRepo.follow(followerId, followedId, status);
    return status;
  }

  @Override
  public void unfollow(Long followerId, Long followedId) {
    followRepo.unfollow(followerId, followedId);
  }

  @Override
  public boolean isFollowing(Long followerId, Long followedId) {
    return followRepo.isFollowing(followerId, followedId);
  }

  @Override
  public void acceptFollowRequest(Long userId, Long requesterId) {
    FollowStatus status =
        followRepo
            .findFollowStatus(requesterId, userId)
            .orElseThrow(
                () -> new IllegalArgumentException("Solicitação de seguir não encontrada"));
    if (status != FollowStatus.PENDING) {
      throw new IllegalArgumentException("Solicitação de seguir não encontrada");
    }
    followRepo.acceptFollow(requesterId, userId);
  }

  @Override
  public void rejectFollowRequest(Long userId, Long requesterId) {
    followRepo.unfollow(requesterId, userId);
  }

  @Override
  public List<User> getPendingFollowRequests(Long userId, int page, int size) {
    return followRepo.findPendingRequests(userId, page, size);
  }

  @Override
  public void deleteAccount(Long userId) {
    userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    tokenRepo.deleteAllByUserId(userId);
    followRepo.deleteAllByUserId(userId);
    userRepo.deleteById(userId);
    searchPort.deleteFromIndex(userId);
  }

  @Override
  public List<User> getFollowers(Long userId, int page, int size) {
    return followRepo.findFollowers(userId, page, size);
  }

  @Override
  public List<User> getFollowing(Long userId, int page, int size) {
    return followRepo.findFollowing(userId, page, size);
  }

  @Override
  public List<User> searchUsers(String term, int page, int size) {
    if (term == null || term.isBlank() || term.length() < 2) return List.of();
    return searchPort.search(term, page, size);
  }
}
