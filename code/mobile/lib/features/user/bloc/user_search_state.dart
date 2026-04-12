import 'package:biblioo/features/user/data/models/follow_page_model.dart';

abstract class UserSearchState {}

class UserSearchInitial extends UserSearchState {}

class UserSearchLoading extends UserSearchState {}

class UserSearchLoaded extends UserSearchState {
  final List<UserSummaryModel> users;
  UserSearchLoaded(this.users);
}

class UserSearchEmpty extends UserSearchState {
  final String query;
  UserSearchEmpty(this.query);
}

class UserSearchError extends UserSearchState {
  final String message;
  UserSearchError(this.message);
}
