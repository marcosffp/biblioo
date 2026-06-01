import 'package:biblioo/features/community/domain/community.dart';
import 'package:equatable/equatable.dart';

abstract class CommunityState extends Equatable {
  @override
  List<Object?> get props => [];
}

class CommunityInitial extends CommunityState {}

class CommunityLoading extends CommunityState {}

class CommunityLoaded extends CommunityState {
  final List<Community> mine;
  final List<Community> suggestions;
  final bool? fromCache;
  final DateTime? lastSyncedAt;

  CommunityLoaded({
    required this.mine,
    required this.suggestions,
    this.fromCache,
    this.lastSyncedAt,
  });

  bool get isFromCache => fromCache ?? false;

  @override
  List<Object?> get props => [mine, suggestions, isFromCache, lastSyncedAt];
}

class CommunityMutating extends CommunityState {}

class CommunityMutationSuccess extends CommunityState {
  final String message;
  CommunityMutationSuccess(this.message);

  @override
  List<Object?> get props => [message];
}

class CommunityError extends CommunityState {
  final String message;
  CommunityError(this.message);

  @override
  List<Object?> get props => [message];
}
