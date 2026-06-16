package com.biblioo.infrastructure.config.seed;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.domain.port.in.FeedPostUseCase;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import com.biblioo.user.domain.model.User;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class FeedSeedService {

  private final ReviewUseCase reviewUseCase;
  private final FeedPostUseCase feedPostUseCase;
  private final CommentUseCase commentUseCase;
  private final ShelfUseCase shelfUseCase;
  private final LikeRepository likeRepository;
  private final BookRepository bookRepository;

  private static final int REVIEWS_PER_USER = 5;
  private static final int POSTS_PER_USER = 4;
  private static final int COMMENTS_PER_CONTENT = 5;

  private static final int[] RATING_PATTERN = {
    5, 4, 5, 3, 4, 5, 4, 5, 2, 4, 5, 3, 5, 4, 1, 5, 4, 5, 3, 5
  };

  // {title} e {author} são substituídos pelos dados reais do livro.
  private static final String[][] REVIEW_TEMPLATES = {
    {},
    {
      "Não consegui me conectar com {title}. Larguei mais de uma vez e voltei por teimosia. Sinceramente, não foi pra mim.",
      "{title} me frustrou. A premissa prometia, mas a narrativa de {author} não sustenta o interesse. Terminei no esforço.",
      "Decepção com {title}. Tinha expectativas altas e {author} simplesmente não entregou o que prometia na sinopse."
    },
    {
      "{title} tem seus méritos, mas o ritmo trava demais. {author} constrói boas ideias que se perdem na execução.",
      "Esperava mais de {title}. Os personagens não me convenceram e o enredo perde força exatamente onde deveria crescer.",
      "Fiquei dividido com {title}. Há trechos muito bons intercalados com partes que simplesmente se arrastam.",
      "A proposta de {title} é original, mas {author} não desenvolve o potencial até o final. Ficou pela metade."
    },
    {
      "Leitura mediana. A proposta de {title} é interessante e {author} escreve bem, mas faltou profundidade nos personagens.",
      "{title} começa promissor, perde um pouco o fio no meio, mas {author} consegue fechar de forma satisfatória.",
      "Nem tão bom quanto esperava, nem ruim. {title} tem momentos que valem, mas não é dos que vou lembrar daqui a um ano.",
      "Três estrelas justas para {title}. {author} escreve com competência, mas a história não me pegou de jeito nenhum.",
      "Gostei de algumas partes de {title}, especialmente o começo. {author} perde o ritmo no segundo ato, mas o final recupera."
    },
    {
      "Gostei muito de {title}. {author} conduz a história com competência e os personagens têm profundidade real. Recomendo.",
      "{title} superou minhas expectativas. Tem trechos mais lentos, mas no geral {author} entrega uma leitura muito sólida.",
      "Leitura excelente. {title} me ganhou aos poucos e o final compensa cada página. {author} sabe exatamente o que faz.",
      "Que boa surpresa foi {title}. A prosa de {author} flui com elegância e a trama prende do começo ao fim.",
      "Quatro estrelas bem merecidas para {title}. {author} cria um universo que você não quer deixar quando acaba.",
      "{title} é o tipo de livro que você recomenda para todo mundo. {author} equilibra entretenimento e profundidade com maestria."
    },
    {
      "Terminei {title} e ainda estou processando. {author} construiu algo que vai ficar comigo por muito tempo. Uma das melhores leituras do ano.",
      "{title} é simplesmente inesquecível. A escrita de {author} te prende da primeira à última página. Já recomendei pra todo mundo que conheço.",
      "Poucos livros me marcaram como {title}. {author} tem uma sensibilidade rara. Fechei o livro e precisei de dias pra começar outro.",
      "Obra-prima, sem exagero. {title} entrou direto pra minha lista de favoritos de todos os tempos. {author} está em outro patamar.",
      "Não lembro a última vez que um livro me prendeu como {title}. O final me deixou sem palavras. {author} é genial.",
      "{title} me fez rir, chorar e pensar — às vezes tudo na mesma página. {author} domina as emoções humanas como poucos escritores.",
      "Cinco estrelas com muito orgulho para {title}. Daqueles livros que mudam sua relação com a literatura para sempre."
    }
  };

  private static final String[] POST_TEMPLATES = {
    "Comecei {title} hoje e as primeiras páginas já me fisgaram. Acho que vai ser rápido.",
    "Maratonei {title} no fim de semana e não me arrependo de nenhuma hora de sono perdida.",
    "Acabei de virar a última página de {title}. Que jornada... preciso discutir isso com alguém!",
    "Relendo {title} e percebendo camadas que passei batido na primeira vez. Releitura é outra experiência.",
    "{title} me fez questionar um monte de coisa. Literatura que mexe com a gente desse jeito é rara e preciosa.",
    "Alguém aqui já leu {title}? Comecei sem expectativa nenhuma e estou completamente fisgado(a).",
    "Terminei {title} de madrugada porque não consegui parar. Aquele clássico 'só mais um capítulo'.",
    "Demorei pra encarar {title} e agora me pergunto por que adiei tanto. Recomendadíssimo.",
    "{title} é daqueles que você fecha e fica olhando pro nada por uns minutos. Que livro.",
    "Adicionei {title} à estante faz tempo e finalmente comecei. Primeira impressão: excelente.",
    "Já no terceiro capítulo de {title} e tenho certeza que vai entrar pra minha lista de favoritos do ano.",
    "{title} é exatamente o que eu precisava ler agora. Às vezes o livro certo chega na hora certa.",
    "Não consigo parar de pensar no final de {title}. {title} é daqueles que ficam ecoando na cabeça por dias.",
    "Indiquei {title} pra três pessoas essa semana. Quando um livro é bom assim a gente quer compartilhar.",
    "Lendo {title} devagar de propósito porque não quero que acabe. Sinal de grande literatura.",
    "Pausa no {title} pra respirar — o ritmo do livro é intenso demais pra não fazer pausa.",
    "{title} chegou como recomendação de um amigo e estou completamente apaixonado(a). A comunidade literária não erra.",
    "De todos os livros que li esse ano, {title} é o que mais vou recomendar. Simplesmente imperdível."
  };

  private static final String[] COMMENT_BOOK_TEMPLATES = {
    "Também amei {title}! Uma das melhores do meu ano com certeza.",
    "{title} tá na minha lista faz tempo. Depois da sua resenha, subiu direto pro topo.",
    "Concordo demais. {title} tem aquele tipo de final que fica ecoando por dias.",
    "Que bom ver alguém falando de {title}! Achei que era subestimado.",
    "Você descreveu {title} exatamente como me senti lendo. Difícil colocar em palavras.",
    "Li {title} no ano passado e sua resenha me deu vontade de reler agora mesmo.",
    "{title} me pegou de surpresa também. Não esperava que fosse me afetar tanto.",
    "Estou no meio de {title} agora e concordo com cada coisa que você disse. Que obra.",
    "Comprei {title} por recomendação e amei. Fico feliz em ver alguém validando minha escolha.",
    "Sua análise de {title} capturou exatamente o que eu achei, mas não consegui verbalizar."
  };

  private static final String[] COMMENT_GENERIC = {
    "Que análise! Capturou exatamente o que eu senti, mas não conseguia descrever.",
    "Preciso ler isso urgente, você fez soar irresistível.",
    "Tive a mesma sensação quando terminei. Aquela mistura de tristeza e satisfação é única.",
    "Anotado! Vai entrar na minha lista do próximo mês sem falta.",
    "Perspectiva interessante, eu interpretei de um jeito um pouco diferente — e é isso que torna a leitura tão rica.",
    "Fiquei com o coração apertado por dias depois desse. Você não está sozinho(a) nessa.",
    "Boa! Se gostou desse, a continuação te espera de braços abertos.",
    "Que vontade de reler agora só de ler o que você escreveu.",
    "Concordo com cada palavra! Você articulou muito melhor do que eu conseguiria.",
    "Isso me convenceu. Estava na dúvida se lia ou não e agora é certeza.",
    "Perfeito! A parte que você mencionou é exatamente onde eu parei de respirar na leitura.",
    "Obrigado(a) por compartilhar. Posts assim fazem a diferença numa comunidade de leitores.",
    "Você me fez lembrar de por que amei esse livro na primeira vez. Quase chorei relendo sua análise.",
    "Que belo texto! Além de leitor(a), você claramente tem o dom da escrita também."
  };

  private static final String[] REPLY_TEMPLATES = {
    "Exatamente! Você entendeu tudo.",
    "Sim! Corre ler, não vai se arrepender.",
    "Haha, comigo é a mesma coisa toda vez que abro um capítulo à noite!",
    "A continuação então... prepare os lenços.",
    "Que bom que você gostou! Adoro quando a recomendação funciona.",
    "Verdade, cada releitura é uma experiência completamente nova.",
    "Concordo! É daqueles que a gente nunca esquece.",
    "E o final então... sem palavras mesmo.",
    "Me avisa quando terminar! Quero saber o que achou.",
    "Sim! E tem tanto detalhe que só percebe na segunda leitura.",
    "Fico feliz que tenha chegado até aqui! Vale cada página.",
    "Que bom ter alguém para dividir essas leituras. A comunidade é tudo.",
    "Exato! E o {autor} tem outros livros que você vai amar também.",
    "Pode ir sem medo. O livro entrega tudo que promete e ainda mais."
  };

  private static final String[][] TAG_SETS = {
    {"leitura", "livros", "resenha"},
    {"booklover", "leitores", "literatura"},
    {"lendo", "biblioteca", "dicasdeleitura"},
    {"clubedolivro", "leitura2026", "livros"},
    {"ficção", "romance", "indicalivro"},
    {"resenha", "literaturaBR", "leituraobrigatoria"}
  };

  public void seedFeed(List<User> users, List<Long> bookIds) {
    if (!users.isEmpty()) {
      try {
        if (reviewUseCase
            .getRecentReviewsByUserId(users.get(0).getId(), PageRequest.of(0, 1))
            .hasContent()) {
          log.info("[Seed-Feed] Feed já populado. Pulando etapa.");
          return;
        }
      } catch (Exception ignored) {
      }
    }

    log.info("[Seed-Feed] Populando feed: reviews, posts, comentários e curtidas...");
    Map<Long, Book> booksById = loadBooks(bookIds);

    createMissingReviews(users, booksById);
    createMissingPosts(users, bookIds, booksById);

    List<Review> allReviews = collectReviews(users);
    List<FeedPost> allPosts = collectPosts(users);

    List<Comment> topComments = new ArrayList<>();
    topComments.addAll(addMissingCommentsOnReviews(users, allReviews, booksById));
    topComments.addAll(addMissingCommentsOnPosts(users, allPosts, booksById));

    addMissingReplies(users, topComments);
    addMissingLikes(users, allReviews, allPosts, topComments);
    log.info("[Seed-Feed] Concluído: {} reviews, {} posts, {} comentários.",
        allReviews.size(), allPosts.size(), topComments.size());
  }

  private Map<Long, Book> loadBooks(List<Long> bookIds) {
    Map<Long, Book> map = new HashMap<>();
    try {
      List<List<Long>> batches = partition(bookIds, 50);
      for (List<Long> batch : batches) {
        bookRepository.findAllById(batch).forEach(b -> map.put(b.getId(), b));
      }
    } catch (Exception e) {
      log.warn("[Seed-Feed] Falha ao carregar metadados dos livros: {}", e.getMessage());
    }
    return map;
  }

  private static <T> List<List<T>> partition(List<T> list, int size) {
    List<List<T>> parts = new ArrayList<>();
    for (int i = 0; i < list.size(); i += size) {
      parts.add(list.subList(i, Math.min(i + size, list.size())));
    }
    return parts;
  }

  private String titleOf(Map<Long, Book> books, Long bookId) {
    Book book = books.get(bookId);
    return (book != null && book.getTitle() != null) ? book.getTitle() : "esse livro";
  }

  private String authorOf(Map<Long, Book> books, Long bookId) {
    Book book = books.get(bookId);
    if (book != null && book.getAuthors() != null && !book.getAuthors().isEmpty()) {
      return book.getAuthors().get(0);
    }
    return "o autor";
  }

  private String fill(String template, Map<Long, Book> books, Long bookId) {
    return template
        .replace("{title}", titleOf(books, bookId))
        .replace("{author}", authorOf(books, bookId));
  }

  private void createMissingReviews(List<User> users, Map<Long, Book> books) {
    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      int baseRating = RATING_PATTERN[ui % RATING_PATTERN.length];
      List<Long> completedBooks = getCompletedBookIds(user.getId());
      int created = 0;

      for (Long bookId : completedBooks) {
        if (created >= REVIEWS_PER_USER) break;
        // Varia a nota: começa na base e oscila ±1 para simular avaliações diversas.
        int rating = Math.max(1, Math.min(5, baseRating - (created % 3 == 0 ? 0 : created % 2)));
        String[] options = REVIEW_TEMPLATES[rating];
        if (options.length == 0) continue;
        String text = fill(options[(ui + created) % options.length], books, bookId);
        try {
          reviewUseCase.createReview(user.getId(), bookId, rating, text);
          created++;
        } catch (Exception e) {
          log.warn(
              "[Seed-Feed] Review ignorada (userId={}, bookId={}): {}",
              user.getId(),
              bookId,
              e.getMessage());
        }
      }
    }
  }

  private List<Long> getCompletedBookIds(Long userId) {
    List<Long> ids = new ArrayList<>();
    try {
      List<Shelf> shelves = shelfUseCase.listShelves(userId);
      for (Shelf shelf : shelves) {
        shelfUseCase.listShelfItems(userId, shelf.getId()).stream()
            .filter(item -> ReadingStatus.COMPLETED == item.getStatus())
            .map(item -> item.getBookId())
            .forEach(ids::add);
      }
    } catch (Exception e) {
      log.warn(
          "[Seed-Feed] Falha ao coletar livros concluídos (userId={}): {}", userId, e.getMessage());
    }
    return ids;
  }

  private List<Review> collectReviews(List<User> users) {
    List<Review> reviews = new ArrayList<>();
    for (User user : users) {
      try {
        reviewUseCase
            .getRecentReviewsByUserId(user.getId(), PageRequest.of(0, REVIEWS_PER_USER + 3))
            .getContent()
            .forEach(reviews::add);
      } catch (Exception e) {
        log.warn(
            "[Seed-Feed] Falha ao coletar reviews (userId={}): {}", user.getId(), e.getMessage());
      }
    }
    return reviews;
  }

  private void createMissingPosts(List<User> users, List<Long> bookIds, Map<Long, Book> books) {
    if (bookIds.isEmpty()) return;
    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      try {
        long existingCount =
            feedPostUseCase
                .getRecentPostsByUserId(user.getId(), PageRequest.of(0, POSTS_PER_USER + 1))
                .getTotalElements();
        if (existingCount >= POSTS_PER_USER) continue;

        int needed = POSTS_PER_USER - (int) existingCount;
        for (int pi = 0; pi < needed; pi++) {
          Long bookId = bookIds.get((ui * 5 + pi * 3) % bookIds.size());
          String text =
              fill(POST_TEMPLATES[(ui * 3 + pi) % POST_TEMPLATES.length], books, bookId);
          List<String> tags = List.of(TAG_SETS[(ui + pi) % TAG_SETS.length]);
          try {
            feedPostUseCase.createPost(user.getId(), bookId, text, List.of(), null, tags, false);
          } catch (Exception e) {
            log.warn("[Seed-Feed] Post ignorado (userId={}): {}", user.getId(), e.getMessage());
          }
        }
      } catch (Exception e) {
        log.warn(
            "[Seed-Feed] Falha ao verificar posts (userId={}): {}", user.getId(), e.getMessage());
      }
    }
  }

  private List<FeedPost> collectPosts(List<User> users) {
    List<FeedPost> posts = new ArrayList<>();
    for (User user : users) {
      try {
        feedPostUseCase
            .getRecentPostsByUserId(user.getId(), PageRequest.of(0, POSTS_PER_USER + 3))
            .getContent()
            .forEach(posts::add);
      } catch (Exception e) {
        log.warn(
            "[Seed-Feed] Falha ao coletar posts (userId={}): {}", user.getId(), e.getMessage());
      }
    }
    return posts;
  }

  private List<Comment> addMissingCommentsOnReviews(
      List<User> users, List<Review> reviews, Map<Long, Book> books) {
    List<Comment> created = new ArrayList<>();
    for (int ri = 0; ri < reviews.size(); ri++) {
      Review review = reviews.get(ri);
      int existing = review.getCommentCount() != null ? review.getCommentCount() : 0;
      if (existing > 0) continue;
      created.addAll(
          createComments(users, review.getUserId(), review.getId(), ri, review.getBookId(), books));
    }
    return created;
  }

  private List<Comment> addMissingCommentsOnPosts(
      List<User> users, List<FeedPost> posts, Map<Long, Book> books) {
    List<Comment> created = new ArrayList<>();
    for (int pi = 0; pi < posts.size(); pi++) {
      FeedPost post = posts.get(pi);
      int existing = post.getCommentCount() != null ? post.getCommentCount() : 0;
      if (existing > 0) continue;
      created.addAll(
          createComments(
              users, post.getUserId(), post.getId(), pi + 1000, post.getBookId(), books));
    }
    return created;
  }

  private List<Comment> createComments(
      List<User> users, Long ownerId, Long parentId, int seed, Long bookId, Map<Long, Book> books) {
    List<Comment> created = new ArrayList<>();
    for (int k = 0; k < COMMENTS_PER_CONTENT; k++) {
      int idx = (seed * 3 + k * 7 + 5) % users.size();
      User commenter = users.get(idx);
      if (commenter.getId().equals(ownerId)) {
        commenter = users.get((idx + 1) % users.size());
      }
      // Alterna entre comentários que citam o livro e reações genéricas.
      String text;
      if (bookId != null && k % 2 == 0) {
        text = fill(COMMENT_BOOK_TEMPLATES[(seed + k) % COMMENT_BOOK_TEMPLATES.length], books, bookId);
      } else {
        text = COMMENT_GENERIC[(seed * 3 + k) % COMMENT_GENERIC.length];
      }
      try {
        Comment comment =
            commentUseCase.createComment(commenter.getId(), parentId, text, List.of(), null);
        created.add(comment);
      } catch (Exception e) {
        log.warn("[Seed-Feed] Comentário ignorado (parentId={}): {}", parentId, e.getMessage());
      }
    }
    return created;
  }

  private void addMissingReplies(List<User> users, List<Comment> topComments) {
    for (int ci = 0; ci < topComments.size(); ci++) {
      // Responde ~2 em cada 3 comentários para simular engajamento mais realista.
      if (ci % 3 == 2) continue;
      Comment comment = topComments.get(ci);

      try {
        boolean hasReplies =
            !commentUseCase
                .getComments(comment.getId(), PageRequest.of(0, 1))
                .getContent()
                .isEmpty();
        if (hasReplies) continue;
      } catch (Exception e) {
        continue;
      }

      int replierIdx = (ci * 5 + 3) % users.size();
      User replier = users.get(replierIdx);
      if (replier.getId().equals(comment.getUserId())) {
        replier = users.get((replierIdx + 1) % users.size());
      }
      String text = REPLY_TEMPLATES[ci % REPLY_TEMPLATES.length];
      try {
        commentUseCase.createReply(replier.getId(), comment.getId(), text);
      } catch (Exception e) {
        log.warn("[Seed-Feed] Reply ignorada (commentId={}): {}", comment.getId(), e.getMessage());
      }
    }
  }

  private void addMissingLikes(
      List<User> users, List<Review> reviews, List<FeedPost> posts, List<Comment> topComments) {

    for (int ri = 0; ri < reviews.size(); ri++) {
      Review review = reviews.get(ri);
      for (int li = 0; li < 8; li++) {
        int idx = (ri * 7 + li * 4 + 3) % users.size();
        User liker = users.get(idx);
        if (liker.getId().equals(review.getUserId())) continue;
        final Long likerId = liker.getId();
        final Long reviewId = review.getId();
        likeIfAbsent(likerId, reviewId, () -> reviewUseCase.likeReview(likerId, reviewId));
      }
    }

    for (int pi = 0; pi < posts.size(); pi++) {
      FeedPost post = posts.get(pi);
      for (int li = 0; li < 7; li++) {
        int idx = (pi * 11 + li * 3 + 5) % users.size();
        User liker = users.get(idx);
        if (liker.getId().equals(post.getUserId())) continue;
        final Long likerId = liker.getId();
        final Long postId = post.getId();
        likeIfAbsent(likerId, postId, () -> feedPostUseCase.likePost(likerId, postId));
      }
    }

    for (int ci = 0; ci < topComments.size(); ci++) {
      Comment comment = topComments.get(ci);
      for (int li = 0; li < 5; li++) {
        int idx = (ci * 13 + li * 5 + 7) % users.size();
        User liker = users.get(idx);
        if (liker.getId().equals(comment.getUserId())) continue;
        final Long likerId = liker.getId();
        final Long commentId = comment.getId();
        likeIfAbsent(likerId, commentId, () -> commentUseCase.likeComment(likerId, commentId));
      }
    }
  }

  private void likeIfAbsent(Long userId, Long contentId, Runnable likeAction) {
    try {
      if (!likeRepository.existsByContentIdAndUserId(contentId, userId)) {
        likeAction.run();
      }
    } catch (Exception e) {
      log.warn(
          "[Seed-Feed] Curtida ignorada (contentId={}, userId={}): {}",
          contentId,
          userId,
          e.getMessage());
    }
  }
}
