package com.biblioo.books.infrasestructure.dto.mapper;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemProgressResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShelfItemMapper {

  @Mapping(source = "item.id", target = "id")
  @Mapping(source = "book.title", target = "bookTitle")
  @Mapping(source = "book.coverUrl", target = "bookCoverUrl")
  ShelfItemResponse toResponse(ShelfItem item, Book book);

  @Mapping(source = "item.id", target = "id")
  @Mapping(source = "book.title", target = "bookTitle")
  @Mapping(source = "book.coverUrl", target = "bookCoverUrl")
  ShelfItemSummaryResponse toSummaryResponse(ShelfItem item, Book book);

  @Mapping(source = "item.id", target = "id")
  @Mapping(source = "book.title", target = "bookTitle")
  @Mapping(source = "book.coverUrl", target = "bookCoverUrl")
  ShelfItemProgressResponse toProgressResponse(ShelfItem item, Book book);
}
