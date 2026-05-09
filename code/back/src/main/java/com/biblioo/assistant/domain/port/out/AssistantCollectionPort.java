package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.CollectionResult;
import java.util.List;

public interface AssistantCollectionPort {

  List<CollectionResult> listCollections(Long userId);

  CollectionResult createCollection(Long userId, String name, String description);

  String addShelfToCollection(Long userId, Long collectionId, Long shelfId);

  String removeShelfFromCollection(Long userId, Long collectionId, Long shelfId);
}
