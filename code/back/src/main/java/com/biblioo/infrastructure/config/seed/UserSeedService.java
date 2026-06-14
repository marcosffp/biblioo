package com.biblioo.infrastructure.config.seed;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserSeedService {

  private final UserRepository userRepository;
  private final AuthUseCase authUseCase;
  private final UserUseCase userUseCase;

  static final List<String[]> USERS =
      List.of(
          new String[] {
            "marcos_alberto",
            "marcos.alberto@biblioo.dev",
            "Seed@2026!",
            "Apaixonado por ficção científica e aventuras épicas. Sempre com um livro na mão."
          },
          new String[] {
            "ana_clara_souza",
            "ana.clara.souza@biblioo.dev",
            "Seed@2026!",
            "Leitora voraz de romances históricos e literatura brasileira clássica."
          },
          new String[] {
            "felipe_martins",
            "felipe.martins@biblioo.dev",
            "Seed@2026!",
            "Fã de suspense e thrillers psicológicos. Adoro uma boa reviravolta."
          },
          new String[] {
            "julia_ferreira",
            "julia.ferreira@biblioo.dev",
            "Seed@2026!",
            "Apaixonada por fantasia e mundos mágicos. Tolkien é meu autor favorito."
          },
          new String[] {
            "lucas_henrique",
            "lucas.henrique@biblioo.dev",
            "Seed@2026!",
            "Curioso por distopias e reflexões sobre o futuro da humanidade."
          },
          new String[] {
            "beatriz_oliveira",
            "beatriz.oliveira@biblioo.dev",
            "Seed@2026!",
            "Mergulhada em clássicos da literatura e poesia. Jane Austen é uma deusa."
          },
          new String[] {
            "gabriel_santos",
            "gabriel.santos@biblioo.dev",
            "Seed@2026!",
            "Entusiasta de ficção científica hard e exploração espacial. Asimov forever."
          },
          new String[] {
            "isabela_costa",
            "isabela.costa@biblioo.dev",
            "Seed@2026!",
            "Leitora de tudo um pouco, mas especialmente dramas contemporâneos."
          },
          new String[] {
            "rafael_pereira",
            "rafael.pereira@biblioo.dev",
            "Seed@2026!",
            "Fã de literatura de terror e horror psicológico. Stephen King é o mestre."
          },
          new String[] {
            "camila_lima",
            "camila.lima@biblioo.dev",
            "Seed@2026!",
            "Apreciadora de YA e histórias de crescimento pessoal. Choro com tudo."
          },
          new String[] {
            "thiago_rodrigues",
            "thiago.rodrigues@biblioo.dev",
            "Seed@2026!",
            "Amante de narrativas históricas e biopics literárias. A história nos ensina."
          },
          new String[] {
            "larissa_alves",
            "larissa.alves@biblioo.dev",
            "Seed@2026!",
            "Devoro romances contemporâneos e literatura francesa. Paris me inspira."
          },
          new String[] {
            "bruno_carvalho",
            "bruno.carvalho@biblioo.dev",
            "Seed@2026!",
            "Nerd de ficção científica e space opera. Tenho mais livros do que roupas."
          },
          new String[] {
            "amanda_nascimento",
            "amanda.nascimento@biblioo.dev",
            "Seed@2026!",
            "Apaixonada por literatura latino-americana e realismo mágico."
          },
          new String[] {
            "diego_araujo",
            "diego.araujo@biblioo.dev",
            "Seed@2026!",
            "Leitor compulsivo de distopias. 1984 mudou minha vida."
          },
          new String[] {
            "fernanda_gomes",
            "fernanda.gomes@biblioo.dev",
            "Seed@2026!",
            "Exploradora de mistérios e policiais clássicos. Agatha Christie rainha."
          },
          new String[] {
            "eduardo_ribeiro",
            "eduardo.ribeiro@biblioo.dev",
            "Seed@2026!",
            "Curioso por filosofia e ensaios. Livros são conversas com gênios mortos."
          },
          new String[] {
            "natalia_vieira",
            "natalia.vieira@biblioo.dev",
            "Seed@2026!",
            "Leitora de fantasia urbana e contos de fadas recontados."
          },
          new String[] {
            "gustavo_mendes",
            "gustavo.mendes@biblioo.dev",
            "Seed@2026!",
            "Fã de aventuras marítimas e explorações. Verne é minha bússola literária."
          },
          new String[] {
            "priscila_campos",
            "priscila.campos@biblioo.dev",
            "Seed@2026!",
            "Amante de literatura nacional e regionalismo. O Brasil tem histórias únicas."
          },
          new String[] {
            "leonardo_freitas",
            "leonardo.freitas@biblioo.dev",
            "Seed@2026!",
            "Entusiasta de space operas e universos expandidos. Duna é sagrado."
          },
          new String[] {
            "vanessa_pinto",
            "vanessa.pinto@biblioo.dev",
            "Seed@2026!",
            "Leitora de romances e literatura escandinava. Hygge e livros: combinação perfeita."
          },
          new String[] {
            "rodrigo_melo",
            "rodrigo.melo@biblioo.dev",
            "Seed@2026!",
            "Apreciador de clássicos russos e existencialismo literário."
          },
          new String[] {
            "juliana_castro",
            "juliana.castro@biblioo.dev",
            "Seed@2026!",
            "Fã de literatura feminista e narrativas de empoderamento."
          },
          new String[] {
            "alexandre_moreira",
            "alexandre.moreira@biblioo.dev",
            "Seed@2026!",
            "Leitor voraz de thrillers tecnológicos e cyberpunk."
          },
          new String[] {
            "renata_sousa",
            "renata.sousa@biblioo.dev",
            "Seed@2026!",
            "Apaixonada por contos e narrativas curtas. Cada palavra conta."
          },
          new String[] {
            "marcelo_teixeira",
            "marcelo.teixeira@biblioo.dev",
            "Seed@2026!",
            "Fã de aventura e épicos. Quanto maior o livro, melhor."
          },
          new String[] {
            "debora_lopes",
            "debora.lopes@biblioo.dev",
            "Seed@2026!",
            "Amante de literatura infantojuvenil e fabulosas histórias de fantasia."
          },
          new String[] {
            "anderson_silva",
            "anderson.silva@biblioo.dev",
            "Seed@2026!",
            "Entusiasta de não-ficção e ciência popular. O conhecimento é poder."
          },
          new String[] {
            "caroline_barbosa",
            "caroline.barbosa@biblioo.dev",
            "Seed@2026!",
            "Leitora de romances históricos e ficção de época. O passado fascina."
          });

  public List<User> ensureUsers() {
    if (userRepository.existsByEmail(USERS.get(0)[1])) {
      log.info("[Seed-Users] Usuários de seed já existem. Carregando do banco.");
      return loadExistingUsers();
    }

    List<User> users = new ArrayList<>();
    for (int i = 0; i < USERS.size(); i++) {
      String[] data = USERS.get(i);
      String username = data[0];
      String email = data[1];
      String password = data[2];
      String bio = data[3];
      boolean isPrivate = (i % 5) < 3;

      try {
        User user =
            userRepository
                .findByEmail(email)
                .orElseGet(
                    () -> {
                      User created = authUseCase.register(username, email, password).user();
                      userUseCase.updateProfile(created.getId(), null, bio, null, null);
                      userUseCase.updateVisibility(created.getId(), isPrivate);
                      log.debug(
                          "[Seed-Users] Usuário '{}' criado (privado={}).", username, isPrivate);
                      return userUseCase.getById(created.getId());
                    });
        users.add(user);
      } catch (Exception e) {
        log.warn("[Seed-Users] Falha com usuário '{}': {}", username, e.getMessage());
      }
    }
    log.info("[Seed-Users] {} usuários disponíveis.", users.size());
    return users;
  }

  private List<User> loadExistingUsers() {
    List<User> users = new ArrayList<>();
    for (String[] data : USERS) {
      userRepository.findByEmail(data[1]).ifPresent(users::add);
    }
    log.info("[Seed-Users] {} usuários de seed carregados do banco.", users.size());
    return users;
  }
}
