import 'package:biblioo/features/share/data/share_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'share_capsule_state.dart';

class ShareCapsuleCubit extends Cubit<ShareCapsuleState> {
  final ShareRepository _repository;

  ShareCapsuleCubit(this._repository) : super(ShareCapsuleInitial());

  Future<void> load({bool forceRefresh = false}) async {
    emit(ShareCapsuleLoading());
    try {
      final bytes = await _repository.getDnaCard(forceRefresh: forceRefresh);
      emit(ShareCapsuleLoaded(bytes));
    } catch (_) {
      emit(ShareCapsuleError());
    }
  }
}
