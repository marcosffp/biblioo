import 'package:biblioo/features/collection/domain/collection.dart';

abstract class CollectionState {}

class CollectionInitial extends CollectionState {}

class CollectionLoading extends CollectionState {}

class CollectionLoaded extends CollectionState {
  final List<Collection> collections;
  CollectionLoaded(this.collections);
}

class CollectionError extends CollectionState {
  final String message;
  CollectionError(this.message);
}

class CollectionMutating extends CollectionState {}

class CollectionMutationSuccess extends CollectionState {
  final String message;
  CollectionMutationSuccess(this.message);
}
