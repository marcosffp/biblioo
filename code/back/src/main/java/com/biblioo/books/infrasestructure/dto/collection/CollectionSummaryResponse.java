package com.biblioo.books.infrasestructure.dto.collection;

import java.util.List;

/**
 * Response resumido de uma coleção — usado na listagem do usuário.
 *
 * <p>Sem timestamps para manter a payload leve. shelfPreviews: até 6 estantes com nome + capa do
 * primeiro livro.
 *
 * <p>Usado em: GET /collections
 */
public record CollectionSummaryResponse(
    Long id, String name, int shelfCount, List<ShelfPreview> shelfPreviews // até 6 estantes
    ) {}
