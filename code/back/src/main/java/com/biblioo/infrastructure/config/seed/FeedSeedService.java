package com.biblioo.infrastructure.config.seed;

import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.domain.port.in.FeedPostUseCase;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import com.biblioo.user.domain.model.User;
import java.util.ArrayList;
import java.util.List;
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


  private static final int[] RATING_PATTERN = {
    5, 4, 5, 4, 3, 5, 4, 5, 3, 4, 5, 4, 5, 4, 3, 5, 4, 5, 4, 5, 5, 4, 3, 5, 4, 5, 4, 3, 5, 4
  };

  private static final String[][] REVIEW_TEXT_BY_RATING = {
    {},
    {
      "Não consegui me conectar com essa leitura. A narrativa é confusa e os personagens não têm a profundidade que esperava. Infelizmente não é para mim."
    },
    {
      "Infelizmente não me cativou tanto quanto esperava. A proposta é interessante, mas a execução deixa a desejar em vários pontos.",
      "Tem suas qualidades, mas os problemas de ritmo e a falta de desenvolvimento nos personagens comprometem bastante a experiência."
    },
    {
      "Uma leitura agradável, mas com pontos a melhorar. O começo é muito promissor, o meio perde um pouco o fio, mas o final acaba compensando.",
      "Leitura razoável. A proposta é interessante e a escrita é competente, mas esperava mais profundidade nos personagens principais.",
      "Nem tão bom quanto esperava, mas também não é ruim. Tem momentos muito bons intercalados com partes mais lentas."
    },
    {
      "Uma leitura muito boa que superou minhas expectativas. A trama é bem construída e os personagens são genuinamente cativantes. Recomendo.",
      "Excelente livro. A narrativa flui bem, a escrita é competente e os personagens têm profundidade real. Imperdível para fãs do gênero.",
      "Gostei muito dessa leitura. A prosa é elegante, a história prende do início ao fim e os personagens são bem desenvolvidos."
    },
    {
      "Uma obra absolutamente imperdível. A construção narrativa é fascinante e os personagens ficam na memória por muito tempo. Uma das melhores leituras do meu ano.",
      "Raramente um livro me prende assim. A escrita é envolvente, o ritmo é perfeito e o final me deixou sem palavras. Já recomendei para todos que conheço.",
      "Obra-prima. Não há outra palavra. A profundidade dos temas e a qualidade da escrita colocam esse livro entre os meus favoritos de todos os tempos.",
      "Simplesmente espetacular. Cada capítulo me prendia mais e o final foi de partir o coração. Precisei de dias para processar tudo."
    }
  };

  private static final String[] POST_TEXTS = {
    "Acabei de terminar mais uma leitura incrível e ainda estou processando tudo... Esse livro vai ficar na cabeça por muito tempo. Alguém mais aqui já leu? 📚",
    "Maratona de leitura esse fim de semana! Perdi a conta de quantas horas li. Vale cada segundo!",
    "Comecei uma nova leitura hoje e as primeiras páginas já me prenderam completamente. Acho que vai ser rápido! 🙈",
    "Relendo um dos meus favoritos e percebendo detalhes que passei batido da primeira vez. Releituras são sempre uma nova descoberta.",
    "Finalmente terminei essa saga épica! Uma jornada que vale muito o investimento de tempo e emoção.",
    "Não consigo parar de pensar nessa história. O final me deixou com tantas reflexões... Preciso discutir com alguém!",
    "Um livro que me fez questionar muitas coisas sobre o mundo e sobre mim mesmo(a). Literatura com esse poder é rara e preciosa.",
    "Comecei sem expectativas e fui completamente surpreendido(a). Às vezes os melhores livros são os que a gente começa sem saber nada.",
    "Para quem gosta do gênero, essa é uma leitura obrigatória. Incrível de início ao fim! ⭐",
    "Estou no meio de uma leitura que não consigo largar. Toda vez que me prometo ler só mais um capítulo... acabo passando da meia-noite! 😂"
  };

  private static final String[] COMMENT_TEXTS = {
    "Concordo totalmente! Esse livro ficou na minha lista por muito tempo e me surpreendeu positivamente.",
    "Eu tive a mesma sensação quando terminei! Aquela mistura de tristeza e satisfação depois de uma boa leitura é única.",
    "Preciso ler urgente! Você faz soar incrível. Vai parar no topo da minha lista agora.",
    "Estou relendo também essa semana! Uma obra dessas merece múltiplas leituras ao longo da vida.",
    "Que análise incrível! Capturou exatamente o que eu senti. Difícil de descrever em palavras o impacto.",
    "Você precisa ler a continuação então! Fica ainda melhor, prometo.",
    "A mesma coisa aconteceu comigo. Passei dias processando depois de terminar. Não conseguia começar outro livro.",
    "Que final! Fiquei com o coração apertado por dias depois de terminar essa leitura.",
    "Também adorei essa leitura! Uma das melhores do meu ano com certeza.",
    "Perspectiva interessante! Eu interpretei de forma um pouco diferente, mas é justamente essa riqueza que torna o livro tão especial.",
    "Boa indicação! Vou adicionar à minha lista de leituras do próximo mês sem falta.",
    "Você capturou perfeitamente a essência da obra. É exatamente como me sinto sobre esse livro."
  };

  private static final String[] REPLY_TEXTS = {
    "Exatamente! Você entendeu tudo! 😄",
    "Sim! Corre ler, não vai se arrepender!",
    "Haha, o mesmo acontece comigo toda vez que começo um capítulo à noite!",
    "A continuação então... prepare os lenços! 🥹",
    "Que ótimo que você gostou! Adoro quando a recomendação funciona.",
    "Verdade! Cada releitura é uma experiência completamente diferente.",
    "Concordo! É daqueles livros que a gente nunca esquece.",
    "E o final então... sem palavras mesmo. 💙"
  };

  private static final String[][] TAG_SETS = {
    {"leitura", "livros", "booktube"},
    {"resenha", "booklover", "leitores"},
    {"livros", "literatura", "leitura"},
    {"booktube", "lendo", "biblioteca"}
  };


  public void seedFeed(List<User> users, List<Long> bookIds) {
    if (!users.isEmpty()) {
      try {
        if (reviewUseCase
            .getRecentReviewsByUserId(users.get(0).getId(), PageRequest.of(0, 1))
            .hasContent()) {
          return;
        }
      } catch (Exception ignored) {
      }
    }


    createMissingReviews(users);
    createMissingPosts(users, bookIds);

    List<Review> allReviews = collectReviews(users);
    List<FeedPost> allPosts = collectPosts(users);

    List<Comment> topComments = new ArrayList<>();
    topComments.addAll(addMissingCommentsOnReviews(users, allReviews));
    topComments.addAll(addMissingCommentsOnPosts(users, allPosts));

    addMissingReplies(users, topComments);
    addMissingLikes(users, allReviews, allPosts, topComments);


  }


  private void createMissingReviews(List<User> users) {
    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      int baseRating = RATING_PATTERN[ui % RATING_PATTERN.length];
      List<Long> completedBooks = getCompletedBookIds(user.getId());
      int created = 0;

      for (Long bookId : completedBooks) {
        if (created >= 3) break;
        int rating = Math.max(1, Math.min(5, baseRating - (created % 2)));
        String[] texts = REVIEW_TEXT_BY_RATING[rating];
        String text = texts[(ui + created) % texts.length];
        try {
          reviewUseCase.createReview(user.getId(), bookId, rating, text);
          created++;
        } catch (Exception e) {
          log.warn("[Seed-Feed] Review ignorada (userId={}, bookId={}): {}", user.getId(), bookId, e.getMessage());
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
      log.warn("[Seed-Feed] Falha ao coletar livros concluídos (userId={}): {}", userId, e.getMessage());
    }
    return ids;
  }

  private List<Review> collectReviews(List<User> users) {
    List<Review> reviews = new ArrayList<>();
    for (User user : users) {
      try {
        reviewUseCase
            .getRecentReviewsByUserId(user.getId(), PageRequest.of(0, 5))
            .getContent()
            .forEach(reviews::add);
      } catch (Exception e) {
        log.warn("[Seed-Feed] Falha ao coletar reviews (userId={}): {}", user.getId(), e.getMessage());
      }
    }
    return reviews;
  }


  private void createMissingPosts(List<User> users, List<Long> bookIds) {
    if (bookIds.isEmpty()) return;
    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      try {
        long existingCount =
            feedPostUseCase
                .getRecentPostsByUserId(user.getId(), PageRequest.of(0, 3))
                .getTotalElements();
        if (existingCount >= 2) continue;

        int needed = 2 - (int) existingCount;
        for (int pi = 0; pi < needed; pi++) {
          Long bookId = bookIds.get((ui * 3 + pi) % bookIds.size());
          String text = POST_TEXTS[(ui * 2 + pi) % POST_TEXTS.length];
          List<String> tags = List.of(TAG_SETS[(ui + pi) % TAG_SETS.length]);
          try {
            feedPostUseCase.createPost(user.getId(), bookId, text, List.of(), null, tags, false);
          } catch (Exception e) {
            log.warn("[Seed-Feed] Post ignorado (userId={}): {}", user.getId(), e.getMessage());
          }
        }
      } catch (Exception e) {
        log.warn("[Seed-Feed] Falha ao verificar posts (userId={}): {}", user.getId(), e.getMessage());
      }
    }
  }

  private List<FeedPost> collectPosts(List<User> users) {
    List<FeedPost> posts = new ArrayList<>();
    for (User user : users) {
      try {
        feedPostUseCase
            .getRecentPostsByUserId(user.getId(), PageRequest.of(0, 5))
            .getContent()
            .forEach(posts::add);
      } catch (Exception e) {
        log.warn("[Seed-Feed] Falha ao coletar posts (userId={}): {}", user.getId(), e.getMessage());
      }
    }
    return posts;
  }


  private List<Comment> addMissingCommentsOnReviews(List<User> users, List<Review> reviews) {
    List<Comment> created = new ArrayList<>();
    for (int ri = 0; ri < reviews.size(); ri++) {
      Review review = reviews.get(ri);
      int existing = review.getCommentCount() != null ? review.getCommentCount() : 0;
      if (existing > 0) continue;
      created.addAll(createComments(users, review.getUserId(), review.getId(), ri));
    }
    return created;
  }

  private List<Comment> addMissingCommentsOnPosts(List<User> users, List<FeedPost> posts) {
    List<Comment> created = new ArrayList<>();
    for (int pi = 0; pi < posts.size(); pi++) {
      FeedPost post = posts.get(pi);
      int existing = post.getCommentCount() != null ? post.getCommentCount() : 0;
      if (existing > 0) continue;
      created.addAll(createComments(users, post.getUserId(), post.getId(), pi + 1000));
    }
    return created;
  }

  private List<Comment> createComments(
      List<User> users, Long ownerId, Long parentId, int seed) {
    List<Comment> created = new ArrayList<>();
    for (int k = 0; k < 3; k++) {
      int idx = (seed * 3 + k * 7 + 5) % users.size();
      User commenter = users.get(idx);
      if (commenter.getId().equals(ownerId)) {
        commenter = users.get((idx + 1) % users.size());
      }
      String text = COMMENT_TEXTS[(seed * 3 + k) % COMMENT_TEXTS.length];
      try {
        Comment comment =
            commentUseCase.createComment(commenter.getId(), parentId, text, List.of(), null);
        created.add(comment);
      } catch (Exception e) {
        log.warn(
            "[Seed-Feed] Comentário ignorado (parentId={}): {}", parentId, e.getMessage());
      }
    }
    return created;
  }


  private void addMissingReplies(List<User> users, List<Comment> topComments) {
    for (int ci = 0; ci < topComments.size(); ci++) {
      if (ci % 2 != 0) continue;
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
      String text = REPLY_TEXTS[ci % REPLY_TEXTS.length];
      try {
        commentUseCase.createReply(replier.getId(), comment.getId(), text);
      } catch (Exception e) {
        log.warn(
            "[Seed-Feed] Reply ignorada (commentId={}): {}", comment.getId(), e.getMessage());
      }
    }
  }


  private void addMissingLikes(
      List<User> users,
      List<Review> reviews,
      List<FeedPost> posts,
      List<Comment> topComments) {

    for (int ri = 0; ri < reviews.size(); ri++) {
      Review review = reviews.get(ri);
      for (int li = 0; li < 5; li++) {
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
      for (int li = 0; li < 4; li++) {
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
      for (int li = 0; li < 3; li++) {
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
          contentId, userId, e.getMessage());
    }
  }
}
