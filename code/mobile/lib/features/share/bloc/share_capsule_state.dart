import 'dart:typed_data';

abstract class ShareCapsuleState {}

class ShareCapsuleInitial extends ShareCapsuleState {}

class ShareCapsuleLoading extends ShareCapsuleState {}

class ShareCapsuleLoaded extends ShareCapsuleState {
  final Uint8List bytes;

  ShareCapsuleLoaded(this.bytes);
}

class ShareCapsuleError extends ShareCapsuleState {}
