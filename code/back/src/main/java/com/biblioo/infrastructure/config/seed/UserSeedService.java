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

  // Ordem FIXA — CommunitySeedService referencia usuários por índice.
  static final List<String[]> USERS =
      List.of(
          new String[] {
            "marcos-alb",
            "marcos.alberto@biblioo.dev",
            "Seed@2026!",
            "Ficção científica, space opera e aventuras épicas. Leio no metrô, no almoço e quando devia estar dormindo."
          },
          new String[] {
            "ana-clara",
            "ana.clara.souza@biblioo.dev",
            "Seed@2026!",
            "Colecionadora serial de leituras. Romances históricos são minha especialidade afetiva — e minha perdição."
          },
          new String[] {
            "felipe-mar",
            "felipe.martins@biblioo.dev",
            "Seed@2026!",
            "Caçador de reviravoltas e conspirações literárias. Nenhum thriller está seguro de mim."
          },
          new String[] {
            "julia-fer",
            "julia.ferreira@biblioo.dev",
            "Seed@2026!",
            "A Terra-Média é minha segunda casa. Fantasia épica e mundos construídos com amor são tudo pra mim."
          },
          new String[] {
            "lucas-hen",
            "lucas.henrique@biblioo.dev",
            "Seed@2026!",
            "Orwell me acordou. Huxley me assustou. Atwood me fez agir. Distopias não são ficção, são avisos."
          },
          new String[] {
            "beatriz-oli",
            "beatriz.oliveira@biblioo.dev",
            "Seed@2026!",
            "Vivo entre Austen, Tolstói e Machado de Assis. A literatura clássica é minha bússola e meu lar."
          },
          new String[] {
            "gabriel-san",
            "gabriel.santos@biblioo.dev",
            "Seed@2026!",
            "Viajante do cosmos em papel e tinta. Asimov, Clarke e Dick são meus companheiros de jornada estelar."
          },
          new String[] {
            "isabela-cos",
            "isabela.costa@biblioo.dev",
            "Seed@2026!",
            "Leitora de tudo um pouco, mas especialmente dramas contemporâneos. Humor literário é sagrado."
          },
          new String[] {
            "rafael-per",
            "rafael.pereira@biblioo.dev",
            "Seed@2026!",
            "Adoro quando a ficção me tira o sono. King, Lovecraft e Poe são meus pesadelos favoritos."
          },
          new String[] {
            "camila-lim",
            "camila.lima@biblioo.dev",
            "Seed@2026!",
            "Especialista em choro literário. YA, romances e histórias de crescimento emocional são meu lar."
          },
          new String[] {
            "thiago-rod",
            "thiago.rodrigues@biblioo.dev",
            "Seed@2026!",
            "A história como narrativa me fascina. Biopics, sagas históricas e ficção de época são minha paixão."
          },
          new String[] {
            "larissa-alv",
            "larissa.alves@biblioo.dev",
            "Seed@2026!",
            "Entre Paris e São Paulo com um romance na bolsa. Literatura francesa e contemporânea brasileira."
          },
          new String[] {
            "bruno-car",
            "bruno.carvalho@biblioo.dev",
            "Seed@2026!",
            "Space opera, hard sci-fi e exploração intergaláctica. Tenho mais livros do que roupas e não me arrependo."
          },
          new String[] {
            "amanda-nas",
            "amanda.nascimento@biblioo.dev",
            "Seed@2026!",
            "Márquez, Borges, Allende — o realismo mágico é onde o impossível e o cotidiano dançam juntos."
          },
          new String[] {
            "diego-ara",
            "diego.araujo@biblioo.dev",
            "Seed@2026!",
            "1984 me mudou. Agora vejo vigilância em tudo. Distopias são documentários disfarçados de ficção."
          },
          new String[] {
            "fernanda-gom",
            "fernanda.gomes@biblioo.dev",
            "Seed@2026!",
            "Resolvo crimes literários desde os 12 anos. Agatha Christie é minha professora particular. Nenhum mistério escapa."
          },
          new String[] {
            "eduardo-rib",
            "eduardo.ribeiro@biblioo.dev",
            "Seed@2026!",
            "Ensaios, filosofia aplicada e não-ficção intelectual. Livros são conversas com gênios mortos."
          },
          new String[] {
            "natalia-vie",
            "natalia.vieira@biblioo.dev",
            "Seed@2026!",
            "Magia escondida nas cidades, fadas nas esquinas e mundos paralelos atrás de portas comuns."
          },
          new String[] {
            "gustavo-men",
            "gustavo.mendes@biblioo.dev",
            "Seed@2026!",
            "Aventureiro de poltrona. Das profundezas do mar ao centro da Terra — Verne e Stevenson me guiam."
          },
          new String[] {
            "priscila-cam",
            "priscila.campos@biblioo.dev",
            "Seed@2026!",
            "Devota da literatura nacional. Do modernismo ao presente, o Brasil tem histórias únicas que o mundo precisa conhecer."
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
