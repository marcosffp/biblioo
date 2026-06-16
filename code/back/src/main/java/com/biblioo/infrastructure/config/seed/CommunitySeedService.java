package com.biblioo.infrastructure.config.seed;

import com.biblioo.community.domain.model.Community;
import com.biblioo.community.domain.model.CommunityInvite;
import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.model.enumeration.CommunityType;
import com.biblioo.community.domain.model.enumeration.ReactionType;
import com.biblioo.community.domain.model.enumeration.TieBreakRule;
import com.biblioo.community.domain.model.enumeration.VotingStatus;
import com.biblioo.community.domain.port.in.BookVotingUseCase;
import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import com.biblioo.community.infrastructure.persistence.MessageReactionRepository;
import com.biblioo.community.infrastructure.dto.voting.ApproveVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.CreateVotingRequest;
import com.biblioo.community.infrastructure.dto.voting.VotingOptionRequest;
import com.biblioo.community.infrastructure.dto.voting.VotingOptionResponse;
import com.biblioo.community.infrastructure.dto.voting.VotingResponse;
import com.biblioo.user.domain.model.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class CommunitySeedService {

  private final CommunityUseCase communityUseCase;
  private final CommunityMessageUseCase messageUseCase;
  private final BookVotingUseCase votingUseCase;
  private final MessageReactionRepository reactionRepository;

  /** Quantidade de comunidades definidas no seed. Usado apenas para logging no orchestrator. */
  public static int communityCount() {
    return COMMUNITIES.size();
  }

  private record CommunityDef(
      String name,
      String description,
      CommunityType type,
      int ownerIdx,
      int[] memberIdxs,
      String[][] messages,
      String votingTitle,
      boolean closeAndApprove) {}

  private static final List<CommunityDef> COMMUNITIES =
      List.of(
          new CommunityDef(
              "Fãs de Tolkien",
              "Grupo para fãs da Terra-Média, da mitologia tolkieniana e de toda obra do Professor.",
              CommunityType.PUBLIC,
              3,
              new int[] {17, 0, 9, 12, 18, 5},
              new String[][] {
                {
                  "0",
                  "Bem-vindos ao clube dos fãs de Tolkien! Aqui discutimos tudo sobre a Terra-Média."
                },
                {
                  "1",
                  "Acabei de terminar O Silmarillion pela primeira vez. Ainda estou digerindo tudo isso."
                },
                {
                  "2",
                  "O Silmarillion é incrível. Tolkien criou uma mitologia completa do zero. Impressionante."
                },
                {
                  "3",
                  "A história de Beren e Lúthien é emocionante demais. Uma das histórias de amor mais épicas que já li."
                },
                {
                  "0",
                  "Alguém já leu Os Filhos de Húrin? É o mais sombrio de todos, mas muito rico narrativamente."
                },
                {
                  "4",
                  "Estou relendo O Hobbit antes de atacar a trilogia pela primeira vez. Alguma dica?"
                },
                {
                  "0",
                  "Leia com calma, sem pressão. O Hobbit já prepara o terreno de forma deliciosa."
                },
                {
                  "5",
                  "Não pule as canções e poemas! Tolkien era poeta também, e fazem parte da experiência completa."
                },
                {
                  "2",
                  "A trilogia do Jackson envelheceu muito bem. O Abismo de Helm continua sendo uma das melhores batalhas do cinema."
                },
                {
                  "6",
                  "O livro tem uma atmosfera ainda mais pesada nessa cena. O discurso de Theoden arrepia."
                },
                {
                  "1",
                  "Curioso: alguém acompanha a série Anéis do Poder? Diverge bastante, mas amo qualquer coisa na Terra-Média."
                },
                {
                  "3",
                  "Estou acompanhando. Tem problemas de fidelidade ao material, mas a produção visual é deslumbrante."
                }
              },
              "Qual obra do Tolkien lemos juntos este mês?",
              true),
          new CommunityDef(
              "Clube de Ficção Científica",
              "Espaço para fãs de FC: do espaço profundo ao cyberpunk, da FC clássica ao new weird.",
              CommunityType.PUBLIC,
              6,
              new int[] {0, 12, 14, 4, 16, 3},
              new String[][] {
                {
                  "0",
                  "Bem-vindos! Um espaço para FC em todas as suas facetas. Clássicos, modernos, hard sci-fi, space opera."
                },
                {
                  "5",
                  "Finalmente uma comunidade assim! Terminei Duna pela segunda vez e cada releitura revela algo novo."
                },
                {
                  "2",
                  "Duna é uma obra-prima de construção de mundo e crítica política. Única no gênero."
                },
                {
                  "3",
                  "Fundação do Asimov foi o que me fez amar FC. A série do Apple TV+ também está muito boa."
                },
                {
                  "4",
                  "Eu, Robô é essencial para entender a FC posterior. As Três Leis moldaram todo o gênero."
                },
                {
                  "1",
                  "Alguém leu Jogador N.1? Li em dois dias. O livro é muito mais detalhado que o filme."
                },
                {
                  "0",
                  "Li quando lançou! As referências de cultura pop são mais ricas e profundas na versão escrita."
                },
                {
                  "5",
                  "Projeto Marte do Andy Weir é quase um manual de sobrevivência. A ciência é fascinantemente real."
                },
                {
                  "2",
                  "Para FC mais literária: A Mão Esquerda das Trevas da Ursula Le Guin. Uma análise de gênero brilhante."
                },
                {
                  "3",
                  "Le Guin é subestimadíssima! Uma das maiores do gênero e pouco reconhecida fora dos círculos literários."
                },
                {
                  "6",
                  "Alguém tem sugestão de FC lançada nos últimos 5 anos? Quero renovar minha lista."
                },
                {
                  "4",
                  "Exhalation do Ted Chiang! Contos que são ensaios filosóficos sobre o humano. Cada um é uma joia."
                }
              },
              "Próxima leitura do clube de FC?",
              false),
          new CommunityDef(
              "Leitores de Clássicos",
              "Grupo dedicado às grandes obras da literatura mundial: dos gregos ao século XX.",
              CommunityType.PUBLIC,
              5,
              new int[] {1, 16, 10, 13, 11},
              new String[][] {
                {
                  "0",
                  "Bem-vindos ao Leitores de Clássicos! Aqui discutimos as grandes obras que moldaram a literatura."
                },
                {
                  "1",
                  "Orgulho e Preconceito continua perfeito depois de 200 anos. A ironia de Austen é cirúrgica e moderna."
                },
                {
                  "2",
                  "Austen era brilhante na crítica social velada. Elizabeth Bennet é um ícone literário até hoje."
                },
                {
                  "3",
                  "Estou relendo Dom Casmurro. A questão 'Capitu culpada?' me parece proposital por Machado. Ambiguidade genial."
                },
                {
                  "0",
                  "Machado de Assis é um dos maiores da literatura mundial. É criminoso que não seja mais reconhecido lá fora."
                },
                {
                  "4",
                  "Frankenstein me surpreendeu. Pensei que era terror puro, mas é uma reflexão profunda sobre criação e responsabilidade."
                },
                {"5", "Mary Shelley escreveu isso aos 18 anos. Simplesmente impressionante."},
                {
                  "1",
                  "Drácula é melhor do que eu esperava! A estrutura epistolar torna a leitura muito mais imersiva."
                },
                {
                  "2",
                  "O romance epistolar do Bram Stoker é muito mais sofisticado do que as adaptações cinematográficas."
                },
                {"3", "Qual clássico vocês indicam para quem está começando com o gênero?"},
                {"0", "O Pequeno Príncipe! Curto, poético, com várias camadas de interpretação."},
                {
                  "4",
                  "Dom Casmurro para literatura brasileira. Ou Orgulho e Preconceito para literatura estrangeira."
                }
              },
              "Qual clássico lemos juntos no próximo mês?",
              true),
          new CommunityDef(
              "Suspense e Terror",
              "Comunidade privada para amantes de suspense psicológico, terror e thrillers literários.",
              CommunityType.PRIVATE,
              8,
              new int[] {2, 15, 14, 9},
              new String[][] {
                {
                  "0",
                  "Bem-vindos ao Suspense e Terror! Espaço para discussões com cuidado com spoilers."
                },
                {
                  "1",
                  "A Paciente Silenciosa foi o thriller que mais me prendeu este ano. O final... não vi chegando."
                },
                {
                  "2",
                  "Concordo! A estrutura narrativa de Michaelides é genial. Reli a última parte duas vezes."
                },
                {
                  "0",
                  "It do King vai muito além do terror. É uma análise profunda do medo da infância e da amizade."
                },
                {
                  "3",
                  "O Iluminado é aterrorizante de forma diferente. O isolamento e a loucura crescem de forma sufocante."
                },
                {
                  "4",
                  "Caixa de Pássaros me deixou paranoico por dias. A ideia do monstro invisível é perturbadora."
                },
                {
                  "1",
                  "Ilha do Medo é excepcional. Reli o começo depois do final para ver os indícios que perdi."
                },
                {
                  "2",
                  "Garota Exemplar é fascinante como estudo de personagem. Amy Dunne é uma das vilãs mais elaboradas da ficção."
                },
                {"0", "Stephen King continua incomparável. Alguém leu suas obras mais recentes?"},
                {
                  "3",
                  "Billy Summers! Diferente do King habitual, mais thriller que terror, mas igualmente envolvente."
                },
                {
                  "4",
                  "E Não Sobrou Nenhum da Christie é perturbador. A solução do problema do narrador é brilhante."
                }
              },
              "Qual thriller lemos juntos este mês?",
              false),
          new CommunityDef(
              "Literatura Brasileira",
              "Comunidade dedicada à rica e diversa tradição literária do Brasil.",
              CommunityType.PUBLIC,
              19,
              new int[] {13, 1, 10, 16, 11},
              new String[][] {
                {
                  "0",
                  "Bem-vindos! A literatura brasileira é riquíssima e subestimada. Aqui celebramos nossos autores."
                },
                {
                  "1",
                  "Torto Arado foi uma revelação. Itamar Vieira Junior escreveu algo único sobre o Brasil profundo."
                },
                {
                  "2",
                  "A violência e a beleza do sertão convivem no livro de forma dolorosa e lírica ao mesmo tempo."
                },
                {
                  "0",
                  "Machado de Assis é indispensável. Dom Casmurro, Memórias Póstumas... é o nosso Shakespeare."
                },
                {
                  "3",
                  "Capitães da Areia do Jorge Amado. Impressionante como ele retrata a pobreza e a resiliência humana."
                },
                {
                  "4",
                  "Vidas Secas do Graciliano Ramos me destruiu emocionalmente. Baleia é um dos personagens mais trágicos que já li."
                },
                {
                  "5",
                  "O Cortiço do Aluísio Azevedo é uma fotografia brutal da desigualdade que ainda ressoa hoje."
                },
                {
                  "1",
                  "Iracema do Alencar é o mito fundador do Brasil de forma poética e ao mesmo tempo problemática."
                },
                {
                  "0",
                  "Contemporâneos: Conceição Evaristo, Silviano Santiago... temos grandes vozes que merecem mais espaço."
                },
                {
                  "2",
                  "Torto Arado ganhou o Jabuti e merecia muito. É o tipo de livro que muda perspectivas."
                },
                {"3", "Qual seria a obra mais importante para entender o Brasil como nação?"},
                {
                  "4",
                  "Grande Sertão: Veredas do Guimarães Rosa. É o nosso Dom Quixote, complexo e único."
                }
              },
              "Qual obra brasileira lemos juntos?",
              true),
          new CommunityDef(
              "Leitores YA",
              "Comunidade privada para fãs de Young Adult e histórias de crescimento e descoberta.",
              CommunityType.PRIVATE,
              9,
              new int[] {7, 17, 11, 3},
              new String[][] {
                {
                  "0",
                  "Olá a todos! Criei essa comunidade para fãs de YA. Histórias de crescimento, amor e descoberta."
                },
                {
                  "1",
                  "A Culpa é das Estrelas me fez chorar muito. John Green capturou algo muito genuíno sobre ser jovem."
                },
                {
                  "2",
                  "Hazel e Augustus são inesquecíveis. A forma como o livro lida com a mortalidade é madura e honesta."
                },
                {
                  "3",
                  "Harry Potter formou toda uma geração de leitores. Sou eternamente grata a essa série."
                },
                {
                  "4",
                  "O capítulo final de Harry Potter me partiu o coração. A cena no Bosque Proibido..."
                },
                {
                  "0",
                  "Extraordinário (Wonder) é muito poderoso. Me fez refletir sobre empatia de forma prática."
                },
                {
                  "1",
                  "Auggie Pullman é inesquecível. A perspectiva múltipla do livro é um recurso narrativo incrível."
                },
                {
                  "2",
                  "Série Divergente ou Jogos Vorazes: qual define melhor o YA distópico para vocês?"
                },
                {"3", "Jogos Vorazes com folga! Katniss é muito mais complexa como protagonista."},
                {
                  "0",
                  "Concordo! Mas Divergente tem uma construção de mundo mais detalhada nos livros."
                },
                {
                  "4",
                  "Alguém leu É Assim que Acaba da Colleen Hoover? Está no limite entre YA e adulto. Muito intenso."
                }
              },
              "Qual livro YA lemos este mês?",
              false),
          new CommunityDef(
              "Distopias e Futurismo",
              "Para quem ama imaginar (ou temer) o futuro. Distopias, utopias e FC que questionam a sociedade.",
              CommunityType.PUBLIC,
              4,
              new int[] {14, 16, 6, 0, 12},
              new String[][] {
                {
                  "0",
                  "Distopias são o espelho que a ficção usa para nos mostrar onde erramos. Bem-vindos!"
                },
                {
                  "1",
                  "1984 do Orwell é mais atual do que nunca. Newspeak e pós-verdade estão acontecendo diante dos nossos olhos."
                },
                {
                  "0",
                  "Assustador como Orwell previu mecanismos de controle tão específicos. A obra é literalmente profética."
                },
                {
                  "2",
                  "Admirável Mundo Novo do Huxley vai na direção oposta: a distopia do prazer e do conforto. Talvez mais realista?"
                },
                {
                  "3",
                  "A questão Huxley vs Orwell é fascinante. Neil Postman argumentou que Huxley tinha mais razão."
                },
                {
                  "4",
                  "O Conto da Aia da Atwood é perturbador porque plausível. A descida para o totalitarismo é gradual."
                },
                {
                  "5",
                  "Atwood disse que só incluiu coisas que já aconteceram na história humana. Isso é o que dá medo."
                },
                {
                  "1",
                  "Fahrenheit 451 tem uma visão diferente: a censura vem da própria sociedade, não do governo."
                },
                {
                  "0",
                  "A ideia de que não precisa proibir livros se as pessoas simplesmente não quiserem mais ler é genial e aterrorizante."
                },
                {
                  "2",
                  "Alguém leu We do Zamyatin? Precede 1984 e Admirável Mundo Novo e os influenciou diretamente."
                },
                {
                  "3",
                  "Não conhecia! Vou buscar agora. E Brave New World Revisited onde Huxley comenta sua própria obra?"
                },
                {
                  "4",
                  "Huxley olha para os anos 50 e percebe que se subestimou: o mundo ia mais rápido do que imaginou."
                }
              },
              "Qual distopia lemos juntos?",
              true),
          new CommunityDef(
              "Mistério e Policial",
              "Comunidade privada dedicada ao gênero policial, do clássico britânico ao noir moderno.",
              CommunityType.PRIVATE,
              15,
              new int[] {2, 10, 8, 0},
              new String[][] {
                {
                  "0",
                  "Bem-vindos ao Mistério e Policial! Espaço para fãs do gênero com atenção aos spoilers."
                },
                {
                  "1",
                  "Agatha Christie é a rainha absoluta. Assassinato no Expresso do Oriente é uma obra de engenho puro."
                },
                {
                  "2",
                  "A solução do Expresso é ao mesmo tempo inesperada e completamente lógica. Genial."
                },
                {
                  "3",
                  "E Não Sobrou Nenhum é perturbador de forma diferente. A tensão cresce a cada capítulo."
                },
                {
                  "4",
                  "A Paciente Silenciosa tem uma revelação que muda tudo que você leu antes. Reli o começo depois."
                },
                {
                  "0",
                  "O Código Da Vinci tem problemas históricos, mas funciona muito bem como thriller de entretenimento."
                },
                {
                  "1",
                  "Dan Brown é criticado pela escrita, mas certamente domina a criação de tensão e urgência narrativa."
                },
                {
                  "2",
                  "Ilha do Medo é excepcional. A solução questiona a natureza da própria realidade e da memória."
                },
                {
                  "3",
                  "Garota Exemplar eleva o gênero. Gillian Flynn subverte as expectativas de forma muito sofisticada."
                },
                {
                  "0",
                  "Alguma recomendação de policial brasileiro? Temos bons autores nesse gênero?"
                },
                {
                  "4",
                  "Tony Bellotto! O Fantasma Sorridente é um noir brasileiro muito bem escrito, com São Paulo como pano de fundo."
                }
              },
              "Qual policial lemos no clube este mês?",
              false));

  public void seedCommunities(List<User> users, List<Long> bookIds) {
    if (bookIds.isEmpty() || users.isEmpty()) return;

    try {
      if (communityUseCase.listCommunities("", PageRequest.of(0, 1)).getTotalElements()
          >= COMMUNITIES.size()) {
        return;
      }
    } catch (Exception ignored) {
    }

    for (int ci = 0; ci < COMMUNITIES.size(); ci++) {
      CommunityDef def = COMMUNITIES.get(ci);
      try {
        Community community = ensureCommunity(def, users, bookIds, ci);
        if (community == null) continue;

        Long ownerId = users.get(def.ownerIdx()).getId();
        List<Long> memberIds = buildMemberIdList(def, users);

        ensureMembers(community, def, ownerId, memberIds);
        ensureMessages(community, ownerId, memberIds, def.messages());
        ensureReactions(community, ownerId, memberIds);
        ensureJoinRequests(community, def, users);
        ensureVoting(community, ownerId, memberIds, def, bookIds, ci);

      } catch (Exception e) {
        log.warn("[Seed-Community] Falha na comunidade '{}': {}", def.name(), e.getMessage());
      }
    }
  }

  private Community ensureCommunity(
      CommunityDef def, List<User> users, List<Long> bookIds, int ci) {
    Page<Community> page = communityUseCase.listCommunities(def.name(), PageRequest.of(0, 10));
    Optional<Community> existing =
        page.getContent().stream().filter(c -> c.getName().equals(def.name())).findFirst();

    if (existing.isPresent()) {
      return existing.get();
    }

    Long ownerId = users.get(def.ownerIdx()).getId();
    int bookIdx = (ci * 5) % bookIds.size();
    Long bookId = bookIds.get(bookIdx);

    try {
      Community community =
          communityUseCase.createCommunity(
              ownerId, def.name(), def.description(), def.type(), bookId);
      return community;
    } catch (Exception e) {
      log.warn("[Seed-Community] Falha ao criar '{}': {}", def.name(), e.getMessage());
      return null;
    }
  }

  private List<Long> buildMemberIdList(CommunityDef def, List<User> users) {
    List<Long> ids = new ArrayList<>();
    ids.add(users.get(def.ownerIdx()).getId());
    for (int idx : def.memberIdxs()) {
      if (idx < users.size()) ids.add(users.get(idx).getId());
    }
    return ids;
  }

  private void ensureMembers(
      Community community, CommunityDef def, Long ownerId, List<Long> memberIds) {
    for (int i = 1; i < memberIds.size(); i++) {
      Long memberId = memberIds.get(i);
      try {
        if (communityUseCase.isMember(community.getId(), memberId)) continue;

        if (def.type() == CommunityType.PUBLIC) {
          communityUseCase.joinCommunity(memberId, community.getId());
        } else {
          CommunityInvite invite =
              communityUseCase.inviteUser(ownerId, community.getId(), memberId);
          communityUseCase.acceptInvite(memberId, invite.getId());
        }

      } catch (Exception e) {
        log.warn(
            "[Seed-Community] Membro {} ignorado em '{}': {}",
            memberId,
            community.getName(),
            e.getMessage());
      }
    }
  }

  private void ensureMessages(
      Community community, Long ownerId, List<Long> memberIds, String[][] messages) {
    try {
      if (!messageUseCase.getRecentMessages(community.getId(), ownerId).isEmpty()) {
        return;
      }
    } catch (Exception e) {
      return;
    }

    for (String[] msg : messages) {
      int memberPos = Integer.parseInt(msg[0]);
      String content = msg[1];
      if (memberPos >= memberIds.size()) continue;
      Long authorId = memberIds.get(memberPos);

      try {
        String clientId = UUID.randomUUID().toString();
        messageUseCase.sendMessage(
            community.getId(), authorId, content, null, Set.of(), List.of(), null, false, clientId);
      } catch (Exception e) {
        log.warn(
            "[Seed-Community] Mensagem ignorada em '{}': {}", community.getName(), e.getMessage());
      }
    }
  }

  /**
   * Adiciona reações (HEART) às mensagens da comunidade, simulando engajamento. Cada mensagem recebe
   * curtidas de alguns membros (exceto o próprio autor). Idempotente: só insere quando a reação
   * ainda não existe, então o toggle nunca remove uma reação já criada.
   */
  private void ensureReactions(Community community, Long ownerId, List<Long> memberIds) {
    if (memberIds.size() < 2) return;

    List<CommunityMessage> messages;
    try {
      messages = messageUseCase.getRecentMessages(community.getId(), ownerId);
    } catch (Exception e) {
      log.warn(
          "[Seed-Community] Falha ao carregar mensagens para reações em '{}': {}",
          community.getName(),
          e.getMessage());
      return;
    }

    for (int mi = 0; mi < messages.size(); mi++) {
      CommunityMessage message = messages.get(mi);
      // ~2/3 das mensagens recebem reações, número variável de curtidas por mensagem.
      if (mi % 3 == 2) continue;
      int reactors = 1 + (mi % Math.min(3, memberIds.size() - 1));

      for (int r = 0; r < reactors; r++) {
        Long reactorId = memberIds.get((mi + r + 1) % memberIds.size());
        if (reactorId.equals(message.getAuthorId())) continue;
        try {
          if (!reactionRepository.existsByMessageIdAndUserIdAndReactionType(
              message.getId(), reactorId, ReactionType.HEART)) {
            messageUseCase.toggleReaction(message.getId(), reactorId, ReactionType.HEART);
          }
        } catch (Exception e) {
          log.warn(
              "[Seed-Community] Reação ignorada (messageId={}, userId={}): {}",
              message.getId(),
              reactorId,
              e.getMessage());
        }
      }
    }
  }

  /**
   * Cria solicitações de entrada pendentes em comunidades privadas, simulando usuários aguardando
   * aprovação. Só se aplica a comunidades PRIVATE (públicas usam join direto). Escolhe usuários que
   * não são o dono nem membros já convidados. Best-effort e tolerante a duplicatas.
   */
  private void ensureJoinRequests(Community community, CommunityDef def, List<User> users) {
    if (def.type() != CommunityType.PRIVATE) return;

    Set<Integer> insiders = new HashSet<>();
    insiders.add(def.ownerIdx());
    for (int idx : def.memberIdxs()) insiders.add(idx);

    int requested = 0;
    for (int i = 0; i < users.size() && requested < 2; i++) {
      // Varre a partir de um offset determinístico para variar os solicitantes entre comunidades.
      int idx = (i + def.ownerIdx() + 1) % users.size();
      if (insiders.contains(idx)) continue;

      Long requesterId = users.get(idx).getId();
      try {
        communityUseCase.requestToJoin(requesterId, community.getId());
        requested++;
      } catch (Exception e) {
        log.warn(
            "[Seed-Community] Solicitação de entrada ignorada (userId={}, '{}'): {}",
            requesterId,
            community.getName(),
            e.getMessage());
      }
    }
  }

  private void ensureVoting(
      Community community,
      Long ownerId,
      List<Long> memberIds,
      CommunityDef def,
      List<Long> bookIds,
      int ci) {
    try {
      if (votingUseCase
          .listVotings(ownerId, community.getId(), PageRequest.of(0, 1))
          .hasContent()) {
        return;
      }
    } catch (Exception e) {
      return;
    }

    List<VotingOptionRequest> options = buildVotingOptions(ci, bookIds);
    if (options.size() < 3) {
      return;
    }

    try {
      LocalDateTime now = LocalDateTime.now();
      CreateVotingRequest request =
          new CreateVotingRequest(
              def.votingTitle(), TieBreakRule.RANDOM_DRAW, now, now.plusDays(30), options);

      VotingResponse voting = votingUseCase.createVoting(ownerId, community.getId(), request);
      VotingResponse active = votingUseCase.publishVoting(ownerId, community.getId(), voting.id());

      List<VotingOptionResponse> opts = active.options();
      for (int i = 1; i < Math.min(memberIds.size(), opts.size() + 1); i++) {
        Long voterId = memberIds.get(i);
        Long optionId = opts.get((i - 1) % opts.size()).id();
        try {
          votingUseCase.castVote(voterId, community.getId(), active.id(), optionId);
        } catch (Exception e) {
          log.warn(
              "[Seed-Community] Voto ignorado (votingId={}, userId={}): {}",
              active.id(),
              voterId,
              e.getMessage());
        }
      }

      if (def.closeAndApprove()) {
        VotingResponse closed = votingUseCase.closeVoting(ownerId, community.getId(), active.id());
        if (closed.status() == VotingStatus.CLOSED) {
          votingUseCase.approveResult(
              ownerId, community.getId(), closed.id(), new ApproveVotingRequest(null));
        }
      }

    } catch (Exception e) {
      log.warn(
          "[Seed-Community] Votação ignorada em '{}': {}", community.getName(), e.getMessage());
    }
  }

  private List<VotingOptionRequest> buildVotingOptions(int communityIdx, List<Long> bookIds) {
    int total = bookIds.size();
    List<VotingOptionRequest> options = new ArrayList<>();
    Set<Long> seen = new HashSet<>();
    int base = (communityIdx * 5) % total;
    for (int i = 0; i < total && options.size() < 4; i++) {
      Long id = bookIds.get((base + i) % total);
      if (seen.add(id)) options.add(new VotingOptionRequest(id));
    }
    return options;
  }
}
