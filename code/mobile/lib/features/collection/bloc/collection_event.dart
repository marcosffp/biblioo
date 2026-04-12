abstract class CollectionEvent {}

class CollectionLoadRequested extends CollectionEvent {}

class CollectionCreateRequested extends CollectionEvent {
  final String name;
  final String? description;
  final List<int>? initialShelfIds;

  CollectionCreateRequested({
    required this.name,
    this.description,
    this.initialShelfIds,
  });
}

class CollectionUpdateRequested extends CollectionEvent {
  final int id;
  final String name;
  final String? description;

  CollectionUpdateRequested({
    required this.id,
    required this.name,
    this.description,
  });
}

class CollectionDeleteRequested extends CollectionEvent {
  final int id;
  CollectionDeleteRequested(this.id);
}

class CollectionAddShelfRequested extends CollectionEvent {
  final int collectionId;
  final int shelfId;

  CollectionAddShelfRequested({
    required this.collectionId,
    required this.shelfId,
  });
}

class CollectionRemoveShelfRequested extends CollectionEvent {
  final int collectionId;
  final int shelfId;

  CollectionRemoveShelfRequested({
    required this.collectionId,
    required this.shelfId,
  });
}
