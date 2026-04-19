package com.biblioo.books.infrasestructure.dto.mapper;

import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.infrasestructure.dto.collection.CollectionResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionSummaryResponse;
import com.biblioo.books.infrasestructure.dto.collection.ShelfPreview;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Converte Collection para os dois contratos de resposta.
 *
 * <p>shelfCount e shelfPreviews não existem na entidade — são derivados das estantes vinculadas,
 * enriquecidas com dados dos itens e dos livros. Recebem esses valores já computados como
 * parâmetros para manter o mapper stateless, desacoplado de repositórios e testável de forma
 * unitária.
 *
 * <p>Convenção de chamada: mapper.toResponse(collection, shelfPreviews)
 * mapper.toSummaryResponse(collection, shelfPreviews)
 */
@Mapper(componentModel = "spring")
public interface CollectionMapper {

  @Mapping(target = "shelfCount", expression = "java(shelfPreviews.size())")
  @Mapping(target = "shelfPreviews", expression = "java(shelfPreviews)")
  @Mapping(target = "stats", expression = "java(stats)")
  CollectionResponse toResponse(
      Collection collection, List<ShelfPreview> shelfPreviews, CollectionStatsResponse stats);

  @Mapping(target = "shelfCount", expression = "java(shelfPreviews.size())")
  @Mapping(target = "shelfPreviews", expression = "java(shelfPreviews)")
  CollectionSummaryResponse toSummaryResponse(
      Collection collection, List<ShelfPreview> shelfPreviews);
}
