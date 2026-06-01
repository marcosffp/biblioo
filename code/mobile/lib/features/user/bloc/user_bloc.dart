import 'package:biblioo/features/user/data/user_repository.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'user_event.dart';
import 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository _repository;

  UserBloc(this._repository) : super(UserInitial()) {
    on<LoadMyProfile>(_onLoadMe);
    on<LoadUserProfile>(_onLoadUser);
    on<UpdateProfile>(_onUpdateProfile);
    on<UpdateVisibility>(_onUpdateVisibility);
    on<FollowUser>(_onFollow);
    on<UnfollowUser>(_onUnfollow);
    on<DeleteAccount>(_onDeleteAccount);
  }

  Future<void> _onLoadMe(LoadMyProfile e, Emitter<UserState> emit) async {
    emit(UserLoading());
    try {
      emit(UserLoaded(await _repository.getMe()));
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onLoadUser(LoadUserProfile e, Emitter<UserState> emit) async {
    emit(UserLoading());
    try {
      emit(UserLoaded(await _repository.getByUsername(e.username)));
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onUpdateProfile(
    UpdateProfile e,
    Emitter<UserState> emit,
  ) async {
    emit(UserLoading());
    try {
      var user = await _repository.updateProfile(
        username: e.username,
        bio: e.bio,
        avatarUrl: e.avatarUrl,
        bannerUrl: e.bannerUrl,
      );

      if (e.isPrivate != null && user.isPrivate != e.isPrivate) {
        user = await _repository.updateVisibility(isPrivate: e.isPrivate!);
      }

      if (e.avatarFilePath != null && e.avatarFilePath!.isNotEmpty) {
        user = await _repository.uploadAvatar(e.avatarFilePath!);
      }

      if (e.bannerFilePath != null && e.bannerFilePath!.isNotEmpty) {
        user = await _repository.uploadBanner(e.bannerFilePath!);
      }

      emit(UserLoaded(user));
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onUpdateVisibility(
    UpdateVisibility e,
    Emitter<UserState> emit,
  ) async {
    try {
      emit(
        UserLoaded(await _repository.updateVisibility(isPrivate: e.isPrivate)),
      );
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onFollow(FollowUser e, Emitter<UserState> emit) async {
    try {
      final status = await _repository.follow(e.username);
      final current = state;
      if (current is UserLoaded && current.user.username == e.username) {
        emit(UserLoaded(current.user.copyWith(followStatus: status)));
      }
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onUnfollow(UnfollowUser e, Emitter<UserState> emit) async {
    try {
      await _repository.unfollow(e.username);
      final current = state;
      if (current is UserLoaded && current.user.username == e.username) {
        emit(
          UserLoaded(
            current.user.copyWith(followStatus: UserFollowStatus.none),
          ),
        );
      }
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _onDeleteAccount(
    DeleteAccount e,
    Emitter<UserState> emit,
  ) async {
    try {
      await _repository.deleteAccount();
    } on Exception catch (e) {
      emit(UserError(e.toString()));
    }
  }
}
