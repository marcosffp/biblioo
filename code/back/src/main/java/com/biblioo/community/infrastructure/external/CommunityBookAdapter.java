package com.biblioo.community.infrastructure.external;

import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommunityBookAdapter implements CommunityBookLookupPort {

  private final BookRepository bookRepository;

  @Override
  public boolean existsById(Long bookId) {
    return bookRepository.existsById(bookId);
  }
}
