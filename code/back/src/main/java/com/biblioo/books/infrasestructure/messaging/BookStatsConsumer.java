package com.biblioo.books.infrasestructure.messaging;

import com.biblioo.books.domain.port.out.MessageIdempotencyPort;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookStatsConsumer {

  private final ShelfItemRepository shelfItemRepository;
  private final BookRepository bookRepository;
  private final MessageIdempotencyPort messageIdempotencyPort;

  @RabbitListener(
      queues = RabbitMQConfig.BOOK_STATS_QUEUE,
      containerFactory = "bookStatsListenerFactory")
  @Transactional
  public void handle(EventMessage message) {
    Long bookId = Long.parseLong(message.getAggregateId());
    if (messageIdempotencyPort.isAlreadyProcessed(message.getEventId())) {
      return;
    }

    switch (message.getEventType()) {
      case RabbitMQConfig.EVENT_BOOK_SHELF_ADDED, RabbitMQConfig.EVENT_BOOK_SHELF_REMOVED ->
          updateReaderCount(bookId);
      case RabbitMQConfig.EVENT_BOOK_REVIEW_STATS ->
          updateRatingStats(bookId, message.getPayload());
      default ->
          log.warn(
              "Tipo de evento desconhecido '"
                  + message.getEventType()
                  + "' para bookId="
                  + bookId
                  + " — ignorando");
    }

    messageIdempotencyPort.markAsProcessed(message.getEventId());
  }

  private void updateReaderCount(Long bookId) {
    long count = shelfItemRepository.countByBookId(bookId);
    bookRepository.updateReaderCount(bookId, count);
  }

  private void updateRatingStats(Long bookId, JsonNode payload) {
    if (payload == null || (!payload.has("newRating") && !payload.has("oldRating"))) {
      log.warn("Payload inválido para atualização de estatísticas. bookId={}", bookId);
      return;
    }

    Integer oldRating = payload.hasNonNull("oldRating") ? payload.get("oldRating").asInt() : null;
    Integer newRating = payload.hasNonNull("newRating") ? payload.get("newRating").asInt() : null;

    bookRepository
        .findById(bookId)
        .ifPresent(
            book -> {
              long count = book.getRatingCount() != null ? book.getRatingCount() : 0;
              double avg = book.getAverageRating() != null ? book.getAverageRating() : 0.0;

              double sum = avg * count;

              if (oldRating != null) {
                sum -= oldRating;
                count -= 1;
              }

              if (newRating != null) {
                sum += newRating;
                count += 1;
              }

              Double newAvg = count > 0 ? sum / count : 0.0;
              Float avgFloat = newAvg > 0 ? newAvg.floatValue() : null;

              bookRepository.updateRatingStats(bookId, avgFloat, count);
            });
  }
}
