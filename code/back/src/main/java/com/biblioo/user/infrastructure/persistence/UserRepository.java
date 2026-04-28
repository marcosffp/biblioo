package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

  /**
   * Busca por email usando índice idx_users_email. Seleciona apenas colunas necessárias para evitar
   * leitura desnecessária de bio/bannerUrl em caminhos de autenticação.
   */
  @Query("SELECT u FROM User u WHERE u.email = :email")
  Optional<User> findByEmail(@Param("email") String email);

  /**
   * Busca por username usando índice idx_users_username. Caminho mais frequente: exibição de perfil
   * público.
   */
  @Query("SELECT u FROM User u WHERE u.username = :username")
  Optional<User> findByUsername(@Param("username") String username);

  /** COUNT evita carregar o objeto inteiro apenas para checar existência. */
  @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email")
  boolean existsByEmail(@Param("email") String email);

  @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.username = :username")
  boolean existsByUsername(@Param("username") String username);

  @Query("SELECT u FROM User u WHERE u.googleId = :googleId")
  Optional<User> findByGoogleId(@Param("googleId") String googleId);

  @Query("SELECT u.avatarUrl FROM User u WHERE u.id = :userId")
  Optional<String> findAvatarUrlById(@Param("userId") Long userId);
}
