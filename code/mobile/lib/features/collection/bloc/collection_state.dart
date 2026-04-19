import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:biblioo/features/collection/domain/collection_statistics.dart';

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

class CollectionStatisticsLoading extends CollectionState {}

class CollectionStatisticsLoaded extends CollectionState {
  final CollectionStatistics statistics;
  CollectionStatisticsLoaded(this.statistics);
}

class CollectionStatisticsError extends CollectionState {
  final String message;
  CollectionStatisticsError(this.message);
}
