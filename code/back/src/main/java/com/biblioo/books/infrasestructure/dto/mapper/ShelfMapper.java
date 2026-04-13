package com.biblioo.books.infrasestructure.dto.mapper;

import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfResponse;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfSummaryResponse;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Converte Shelf para os contratos de resposta.
 *
 * <p>coverPreview e itemCount não existem na entidade — são derivados dos itens da estante
 * enriquecidos com dados dos livros. Por isso recebem esses valores já computados como parâmetros
 * separados, mantendo o mapper stateless e testável.
 *
 * <p>Convenção de chamada: mapper.toResponse(shelf, itemCount, coverPreview)
 * mapper.toSummaryResponse(shelf, itemCount, coverPreview)
 */
@Mapper(componentModel = "spring")
public interface ShelfMapper {

  @Mapping(target = "itemCount", expression = "java(itemCount)")
  @Mapping(target = "coverPreview", expression = "java(coverPreview)")
  ShelfResponse toResponse(Shelf shelf, int itemCount, List<String> coverPreview);

  @Mapping(target = "itemCount", expression = "java(itemCount)")
  @Mapping(target = "coverPreview", expression = "java(coverPreview)")
  ShelfSummaryResponse toSummaryResponse(Shelf shelf, int itemCount, List<String> coverPreview);
}
