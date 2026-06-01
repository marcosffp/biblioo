import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/share_repository.dart';
import 'share_event.dart';
import 'share_state.dart';

class ShareBloc extends Bloc<ShareEvent, ShareState> {
  final ShareRepository _repository;

  ShareBloc(this._repository) : super(ShareInitial()) {
    on<ShareCapsuleRequested>(_onCapsuleRequested);
  }

  Future<void> _onCapsuleRequested(
    ShareCapsuleRequested event,
    Emitter<ShareState> emit,
  ) async {
    emit(ShareLoading());
    try {
      final capsule = await _repository.getDnaCard(
        userId: event.userId,
        refreshRemote: event.refreshRemote,
      );
      emit(ShareLoaded(capsule));
    } catch (e, st) {
      debugPrint('[ShareBloc] ${event.runtimeType}: $e\n$st');
      emit(ShareError('Nao foi possivel gerar a capsula.'));
    }
  }
}
