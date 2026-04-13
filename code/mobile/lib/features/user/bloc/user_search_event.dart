abstract class UserSearchEvent {}

class UserSearchRequested extends UserSearchEvent {
  final String query;
  UserSearchRequested(this.query);
}

class UserSearchCleared extends UserSearchEvent {}
