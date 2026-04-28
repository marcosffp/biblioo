package com.biblioo.user.domain.port.in;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import java.util.List;

public interface UserUseCase {

  User getById(Long id);

  User getByUsername(String username);

  /**
   * Retorna o perfil com visibilidade aplicada. Se o perfil for privado e o viewer não for seguidor
   * nem o próprio dono, {@link ProfileAccess#restricted()} será true.
   *
   * @param viewerId id do usuário que está consultando, ou null se não autenticado
   */
  ProfileAccess getProfile(Long viewerId, String username);

  User updateProfile(Long userId, String username, String bio, String avatarUrl, String bannerUrl);

  User updateVisibility(Long userId, boolean isPrivate);

  User uploadAvatar(Long userId, byte[] imageBytes);

  User uploadBanner(Long userId, byte[] imageBytes);

  /**
   * Segue um usuário. Se o perfil alvo for privado, cria uma solicitação pendente e retorna {@link
   * FollowStatus#PENDING}. Caso contrário, segue diretamente e retorna {@link
   * FollowStatus#ACCEPTED}.
   */
  FollowStatus follow(Long followerId, Long followedId);

  void unfollow(Long followerId, Long followedId);

  boolean isFollowing(Long followerId, Long followedId);

  /** Aceita uma solicitação de seguir recebida. {@code userId} é o dono da conta. */
  void acceptFollowRequest(Long userId, Long requesterId);

  /** Rejeita ou cancela uma solicitação de seguir. {@code userId} é o dono da conta. */
  void rejectFollowRequest(Long userId, Long requesterId);

  /** Lista os usuários com solicitação de seguir pendente para {@code userId}. */
  List<User> getPendingFollowRequests(Long userId, int page, int size);

  void deleteAccount(Long userId);

  List<User> getFollowers(Long userId, int page, int size);

  List<User> getFollowing(Long userId, int page, int size);

  List<User> searchUsers(String term, int page, int size);
}
