import 'package:biblioo/features/feed/domain/post.dart';

abstract class PostState {}

class PostInitial extends PostState {}

class PostCreating extends PostState {}

class PostCreateSuccess extends PostState {
  final Post post;

  PostCreateSuccess(this.post);
}

class PostCreateError extends PostState {
  final String message;

  PostCreateError(this.message);
}
