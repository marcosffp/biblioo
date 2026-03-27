package com.biblioo.books.infrasestructure.dto.mapper;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.dto.BookResponse;
import com.biblioo.books.infrasestructure.dto.BookSuggestResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookMapper {

  BookResponse toResponse(Book book);

  BookSuggestResponse toSuggestResponse(Book book);
}
