import 'package:equatable/equatable.dart';

import 'package:biblioo/features/share/domain/share_capsule.dart';

abstract class ShareState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ShareInitial extends ShareState {}

class ShareLoading extends ShareState {}

class ShareLoaded extends ShareState {
  final ShareCapsule capsule;

  ShareLoaded(this.capsule);

  @override
  List<Object?> get props => [capsule.bytes, capsule.cachedAt];
}

class ShareError extends ShareState {
  final String message;

  ShareError(this.message);

  @override
  List<Object?> get props => [message];
}
