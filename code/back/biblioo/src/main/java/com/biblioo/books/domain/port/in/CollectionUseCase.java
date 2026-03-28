package com.biblioo.books.domain.port.in;

import com.biblioo.books.domain.model.Collection;
import java.util.List;

public interface CollectionUseCase {
    List<Collection> listCollections(Long userId);
    Collection getCollection(Long userId, Long collectionId);
    Collection createCollection(Long userId, String name, String description, List<Long> initialShelfIds);
    Collection updateCollection(Long userId, Long collectionId, String name, String description);
    void addShelfToCollection(Long userId, Long collectionId, Long shelfId);
    void removeShelfFromCollection(Long userId, Long collectionId, Long shelfId);
    void deleteCollection(Long userId, Long collectionId);

}
