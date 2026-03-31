package com.biblioo.books.infrasestructure.messaging;

import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class BookStatsConsumer {

  private final ShelfItemRepository shelfItemRepository;
  private final BookRepository bookRepository;
  private final OutboxEventService outboxEventService;

  @RabbitListener(
      queues = RabbitMQConfig.BOOK_STATS_QUEUE,
      containerFactory = "bookStatsListenerFactory")
  @Transactional
  public void handle(EventMessage message) {
    Long bookId = Long.parseLong(message.getAggregateId());

    System.out.println(
        "Recebido evento book-stats "
            + message.getEventId()
            + " ["
            + message.getEventType()
            + "] para bookId="
            + bookId);

    if (outboxEventService.isAlreadyProcessed(message.getEventId())) {
      System.out.println(
          "Evento " + message.getEventId() + " já processado — ignorando (guarda de idempotência)");
      return;
    }

    switch (message.getEventType()) {
      case RabbitMQConfig.EVENT_BOOK_SHELF_ADDED, RabbitMQConfig.EVENT_BOOK_SHELF_REMOVED ->
          updateReaderCount(bookId);
      case RabbitMQConfig.EVENT_BOOK_REVIEW_STATS -> updateRatingStats(bookId);
      default ->
          System.out.println(
              "Tipo de evento desconhecido '"
                  + message.getEventType()
                  + "' para bookId="
                  + bookId
                  + " — ignorando");
    }

    outboxEventService.markAsProcessed(message.getEventId());
    System.out.println(
        "Evento " + message.getEventId() + " processado com sucesso para bookId=" + bookId);
  }

  private void updateReaderCount(Long bookId) {
    long count = shelfItemRepository.countByBookId(bookId);
    bookRepository.updateReaderCount(bookId, count);
    System.out.println("bookId=" + bookId + " → readerCount atualizado para " + count);
  }

  private void updateRatingStats(Long bookId) {
    Double avg = shelfItemRepository.calculateAverageRating(bookId);
    long ratingCount = shelfItemRepository.countRatings(bookId);
    Float avgFloat = avg != null ? avg.floatValue() : null;
    bookRepository.updateRatingStats(bookId, avgFloat, ratingCount);
    System.out.println(
        "bookId="
            + bookId
            + " → averageRating="
            + avgFloat
            + " ratingCount="
            + ratingCount
            + " atualizado");
  }
}
