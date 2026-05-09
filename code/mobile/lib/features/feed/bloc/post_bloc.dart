import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/feed_repository.dart';
import 'post_event.dart';
import 'post_state.dart';

class PostBloc extends Bloc<PostEvent, PostState> {
  final FeedRepository _repository;

  PostBloc(this._repository) : super(PostInitial()) {
    on<PostCreateRequested>(_onCreate);
  }

  Future<void> _onCreate(
    PostCreateRequested event,
    Emitter<PostState> emit,
  ) async {
    emit(PostCreating());
    try {
      final post = await _repository.createPost(
        text: event.text,
        bookId: event.bookId,
        tags: event.tags,
        hasSpoiler: event.hasSpoiler,
        images: event.images,
        imageNames: event.imageNames,
        gif: event.gif,
        gifName: event.gifName,
      );
      emit(PostCreateSuccess(post));
    } catch (_) {
      emit(PostCreateError('Nao foi possivel publicar o post.'));
    }
  }
}
