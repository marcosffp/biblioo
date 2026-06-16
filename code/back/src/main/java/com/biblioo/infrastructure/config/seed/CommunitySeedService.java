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
          // ── 0 ── Fãs de Tolkien ─────────────────────────────────────────────────
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

          // ── 1 ── Clube de Ficção Científica ─────────────────────────────────────
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

          // ── 2 ── Leitores de Clássicos ──────────────────────────────────────────
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

          // ── 3 ── Suspense e Terror (PRIVADA) ────────────────────────────────────
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

          // ── 4 ── Literatura Brasileira ───────────────────────────────────────────
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

          // ── 5 ── Leitores YA (PRIVADA) ──────────────────────────────────────────
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

          // ── 6 ── Distopias e Futurismo ───────────────────────────────────────────
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

          // ── 7 ── Mistério e Policial (PRIVADA) ──────────────────────────────────
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
              false),

          // ── 8 ── Realismo Mágico ─────────────────────────────────────────────────
          new CommunityDef(
              "Realismo Mágico",
              "Para quem acredita que o impossível e o cotidiano convivem na melhor literatura latino-americana e além.",
              CommunityType.PUBLIC,
              13,
              new int[] {3, 5, 17, 19, 11},
              new String[][] {
                {"0", "Bem-vindos! O realismo mágico é onde o extraordinário e o banal dançam juntos. Vamos explorar!"},
                {"1", "Cem Anos de Solidão é a bíblia do gênero. García Márquez criou algo completamente único na literatura."},
                {"2", "O que mais me impressiona em Márquez é como o sobrenatural é tratado como algo óbvio. Sem nenhum drama."},
                {"3", "Já li Cem Anos de Solidão três vezes. Cada releitura revela detalhes novos que mudam tudo que achei entender."},
                {"0", "Borges é diferente: mais filosófico, mais labiríntico. Ficções é um dos maiores livros que já li na vida."},
                {"4", "O Alquimista do Paulo Coelho é mais acessível, mas às vezes simplista demais perto de Márquez ou Borges."},
                {"1", "Isabel Allende em A Casa dos Espíritos é deslumbrante. O feminismo e a magia se entrelaçam com perfeição."},
                {"2", "Pedro Páramo do Juan Rulfo é mais estranho e perturbador que Márquez. Menos lido, mas absolutamente essencial."},
                {"5", "Saramago com O Ensaio sobre a Cegueira usa o absurdo para crítica social de forma singular e brutal."},
                {"3", "Saramago tecnicamente não é realismo mágico puro, mas o elemento do absurdo é um parente próximo do gênero."},
                {"0", "Toni Morrison com Amada também usa elementos mágicos de forma poderosa. Amplia o gênero para além da América Latina."},
                {"4", "Alguém leu Como Água Para Chocolate da Laura Esquivel? A culinária e a magia se fundem de maneira lindíssima."}
              },
              "Qual obra do realismo mágico lemos juntos?",
              false),

          // ── 9 ── Clube do Romance ────────────────────────────────────────────────
          new CommunityDef(
              "Clube do Romance",
              "Espaço para quem ama histórias de amor, conexões humanas e emoção do começo ao fim. De Austen a Hoover.",
              CommunityType.PUBLIC,
              11,
              new int[] {9, 7, 1, 18, 5},
              new String[][] {
                {"0", "Bem-vindos ao Clube do Romance! Porque a gente sempre precisa de histórias que aquecem o coração."},
                {"1", "Onde Crescem os Afetos da Emily Henry é perfeito. A tensão emocional entre os protagonistas é sufocante no bom sentido."},
                {"2", "Emily Henry é a rainha do romance contemporâneo. Cada livro parece uma conversa que você precisava ter."},
                {"0", "Orgulho e Preconceito criou o template do romance moderno. Darcy e Elizabeth são absolutamente eternos."},
                {"3", "A sensação de ler Austen é diferente de tudo. A ironia fina e o romance se equilibram de forma perfeita."},
                {"4", "Colleen Hoover divide opiniões, mas É Assim que Acaba me deixou completamente destruída por dias."},
                {"1", "Hoover tem um talento indiscutível para criar personagens que você sente que conhece de verdade."},
                {"5", "Julho, Julho da Maeve Binchy é encantador. Romance de forma mais quieta, profunda e verdadeira."},
                {"2", "Alguém leu Uma Cúmplice Perfeita da Jojo Moyes? Choro garantido — do começo ao fim, sem parar."},
                {"3", "Jojo Moyes é boa em criar situações aparentemente impossíveis com saídas inesperadas e emocionantes."},
                {"0", "Me Before You foi um fenômeno absoluto. Polarizador, mas inegavelmente poderoso emocionalmente."},
                {"4", "Qual o romance que mais te fez chorar de todos? Preciso de uma indicação que destrua completamente minha vida."}
              },
              "Qual romance lemos juntos este mês?",
              true),

          // ── 10 ── Filosofia e Ensaios ────────────────────────────────────────────
          new CommunityDef(
              "Filosofia e Ensaios",
              "Para quem lê filosofia, ensaios e não-ficção intelectual. Pensar melhor é uma forma de viver melhor.",
              CommunityType.PUBLIC,
              16,
              new int[] {10, 4, 14, 0, 6},
              new String[][] {
                {"0", "Bem-vindos! Filosofia é o que nos ajuda a pensar melhor sobre tudo — inclusive sobre literatura."},
                {"1", "O Mito de Sísifo do Camus mudou completamente minha relação com o absurdo e o sentido da vida."},
                {"2", "Camus consegue ser profundo sem ser hermético. O Estrangeiro então... uma aula de escrita existencialista."},
                {"3", "Nietzsche é mal interpretado quase sempre. Ler o original, sem filtros, é uma experiência transformadora."},
                {"0", "Assim Falou Zaratustra é poesia filosófica. Uma das leituras mais densas e gratificantes que tive."},
                {"4", "Hannah Arendt em A Condição Humana é assustadoramente atual. Ela previu o declínio do espaço político."},
                {"1", "Origens do Totalitarismo dela é obrigatório. Nunca foi tão urgente entender como o fascismo surge e se consolida."},
                {"5", "Sartre com O Ser e o Nada é difícil, mas A Náusea é a porta de entrada perfeita para o existencialismo."},
                {"2", "Bertrand Russell escrevia filosofia de forma clara e acessível. A Conquista da Felicidade é muito subestimada."},
                {"3", "Viktor Frankl com Em Busca de Sentido é filosofia vivida. Difícil não se emocionar com cada página do livro."},
                {"0", "Filosofia e literatura se tocam tanto. Dostoiévski é mais filósofo do que muitos filósofos declarados."},
                {"4", "Crime e Castigo como exploração da culpa e da consciência. Filosofia em forma de romance. Incomparável."}
              },
              "Qual ensaio ou obra filosófica lemos juntos?",
              false),

          // ── 11 ── Aventura e Exploração ──────────────────────────────────────────
          new CommunityDef(
              "Aventura e Exploração",
              "Para aventureiros de poltrona. Das profundezas do mar às montanhas mais altas — tudo em papel e tinta.",
              CommunityType.PUBLIC,
              18,
              new int[] {12, 6, 0, 4, 13},
              new String[][] {
                {"0", "Bem-vindos! Para os que exploram o mundo em poltrona, com um bom livro e a imaginação no limite."},
                {"1", "Vinte Mil Léguas Submarinas ainda é emocionante hoje. Verne tinha uma imaginação científica extraordinária."},
                {"2", "O que impressiona em Verne é que ele escrevia hard sci-fi antes do termo existir. Tudo muito bem embasado."},
                {"0", "A Ilha do Tesouro do Stevenson formou gerações de leitores. Pirata, tesouro e traição desde a primeira página."},
                {"3", "Jack London em O Chamado Selvagem é uma experiência visceral. A escrita é tão vívida que você sente o frio."},
                {"4", "Caninos Brancos então! London escrevia sobre a natureza com um respeito que poucos tinham na época."},
                {"1", "O Conde de Monte Cristo é aventura e vingança em estado puro. Dumas construiu um dos melhores enredos da literatura."},
                {"5", "É impossível não torcer para Edmond Dantès. Dumas domina a arte de criar personagens que você abraça."},
                {"2", "Alguém leu A Volta ao Mundo em 80 Dias? É mais reflexivo do que parece — Fogg é um personagem fascinante."},
                {"3", "Rider Haggard com As Minas do Rei Salomão foi o primeiro romance de aventura africana. Seminal demais."},
                {"0", "Hoje quero recomendar O Nome do Vento do Patrick Rothfuss. Fantasia épica com espírito de aventura puro."},
                {"4", "Rothfuss constrói um protagonista ao mesmo tempo arrogante e irresistível. Kingkiller Chronicle é completamente viciante."}
              },
              "Qual aventura embarcamos juntos este mês?",
              true),

          // ── 12 ── Poesia e Contos (PRIVADA) ──────────────────────────────────────
          new CommunityDef(
              "Poesia e Contos",
              "Comunidade privada para quem ama a palavra curta e intensa. Poesia, contos e a arte da narrativa breve.",
              CommunityType.PRIVATE,
              5,
              new int[] {11, 17, 1, 19},
              new String[][] {
                {"0", "Bem-vindos ao espaço da palavra curta e intensa. Poesia e contos — onde cada palavra carrega um universo."},
                {"1", "Carlos Drummond de Andrade é o maior poeta brasileiro. 'No meio do caminho tinha uma pedra' é um manifesto."},
                {"2", "Drummond tem aquela melancolia carioca misturada com ironia mineira. Único. Absolutamente inimitável."},
                {"0", "Fernando Pessoa e seus heterônimos são uma experiência literária completa. Caeiro, Reis, Campos — cada um um universo."},
                {"3", "Clarice Lispector nos contos é devastadora. Felicidade Clandestina tem mais emoção em três páginas do que muitos romances."},
                {"4", "A Hora da Estrela da Clarice tem a densidade poética dos melhores contos concentrada em uma novela curta."},
                {"1", "Edgar Allan Poe inventou o conto moderno. O Corvo e O Gato Preto são obras de precisão e horror psicológico."},
                {"2", "Poe é assombroso em como cria atmosfera com tão poucas palavras. Cada vírgula é calculada e intencional."},
                {"0", "Rainer Maria Rilke nas Elegias de Duíno é difícil e transcendente. Precisa de atenção, mas vale absolutamente tudo."},
                {"3", "As Cartas a um Jovem Poeta do Rilke são filosofia, poesia e conselho de vida. Reli sempre que preciso de ancoragem."},
                {"4", "Manoel de Barros é subestimado fora do Brasil. Sua poesia do Pantanal é completamente única na língua portuguesa."},
                {"1", "Adélia Prado é essencial. Poesia que fala de fé, cotidiano e mulher com uma voz completamente singular e brasileira."}
              },
              "Qual coletânea de poesia ou contos lemos este mês?",
              false),

          // ── 13 ── Mangá e Quadrinhos ─────────────────────────────────────────────
          new CommunityDef(
              "Mangá e Quadrinhos",
              "Mangá e graphic novels também são literatura. Venha discutir os melhores do formato com a gente.",
              CommunityType.PUBLIC,
              7,
              new int[] {9, 17, 3, 12, 2},
              new String[][] {
                {"0", "Bem-vindos! Mangá e quadrinhos também são literatura — e é hora de discutir as melhores obras do formato."},
                {"1", "Sandman do Neil Gaiman é literalmente a melhor graphic novel de todos os tempos. Mitologia, sonho e humanidade."},
                {"2", "Gaiman transforma o Senhor dos Sonhos em algo profundamente humano. A escrita é poesia em quadrinhos."},
                {"0", "Maus do Art Spiegelman ganhou o Pulitzer por um motivo. Holocausto em forma de quadrinhos — devastador e necessário."},
                {"3", "Maus é devastador. O meta-nível da história do pai contada pelo filho adiciona camadas impossíveis de ignorar."},
                {"4", "Akira do Katsuhiro Otomo criou o cyberpunk visual. A arte é de outro nível — cada painel é uma pintura épica."},
                {"1", "One Piece tem mais de 1000 capítulos e cada arco é melhor que o anterior. Oda é o narrador mais ambicioso dos quadrinhos."},
                {"5", "A profundidade emocional de One Piece surpreende sempre. Oda constrói e paga setups de centenas de capítulos."},
                {"2", "Fullmetal Alchemist da Hiromu Arakawa é perfeito em estrutura. Zero capítulo desnecessário em toda a obra."},
                {"3", "FMA tem uma das melhores conclusões de mangá. Arakawa planejou tudo desde o início com maestria incrível."},
                {"0", "Persépolis da Marjane Satrapi é autobiografia, história e arte em quadrinhos. Indispensável para entender o Irã moderno."},
                {"4", "Satrapi usa o preto e branco de forma expressiva. Cada traço simples carrega peso histórico e emocional imenso."}
              },
              "Qual mangá ou graphic novel lemos juntos?",
              true));

  public void seedCommunities(List<User> users, List<Long> bookIds) {
    if (bookIds.isEmpty() || users.isEmpty()) return;

    try {
      if (communityUseCase.listCommunities("", PageRequest.of(0, 1)).getTotalElements()
          >= COMMUNITIES.size()) {
        log.info("[Seed-Community] {} comunidades já existem. Pulando etapa.", COMMUNITIES.size());
        return;
      }
    } catch (Exception ignored) {
    }

    log.info("[Seed-Community] Criando {} comunidades...", COMMUNITIES.size());
    for (int ci = 0; ci < COMMUNITIES.size(); ci++) {
      CommunityDef def = COMMUNITIES.get(ci);
      log.info("[Seed-Community] {}/{}: '{}'", ci + 1, COMMUNITIES.size(), def.name());
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
    log.info("[Seed-Community] Concluído.");
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
      return communityUseCase.createCommunity(
          ownerId, def.name(), def.description(), def.type(), bookId);
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

  private void ensureJoinRequests(Community community, CommunityDef def, List<User> users) {
    if (def.type() != CommunityType.PRIVATE) return;

    Set<Integer> insiders = new HashSet<>();
    insiders.add(def.ownerIdx());
    for (int idx : def.memberIdxs()) insiders.add(idx);

    int requested = 0;
    for (int i = 0; i < users.size() && requested < 2; i++) {
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
