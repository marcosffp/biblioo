import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/book_repository.dart';
import 'book_event.dart';
import 'book_state.dart';

/// Bloc da feature book — só chama repository, nunca datasources.
/// Implementa debounce de 500ms via Timer para evitar chamadas excessivas.
class BookBloc extends Bloc<BookEvent, BookState> {
  final BookRepository _repository;
  Timer? _debounce;

  BookBloc(this._repository) : super(BookInitial()) {
    on<BookSearchRequested>(_onSearch);
    on<BookSearchCleared>(_onClear);
  }

  Future<void> _onSearch(
    BookSearchRequested event,
    Emitter<BookState> emit,
  ) async {
    final query = event.query.trim();

    // Ignora queries muito curtas
    if (query.length < 2) {
      emit(BookInitial());
      return;
    }

    emit(BookLoading());

    // Debounce: aguarda 500ms antes de executar a busca
    // Usa um Completer para integrar o Timer com o fluxo async do Bloc
    final completer = Completer<void>();
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      completer.complete();
    });

    try {
      await completer.future;
    } catch (_) {
      return;
    }

    // Verifica se outro evento já foi emitido durante o debounce
    if (emit.isDone) return;

    try {
      final books = await _repository.searchBooks(query);
      if (emit.isDone) return;

      if (books.isEmpty) {
        emit(BookEmpty(query));
      } else {
        emit(BookLoaded(books));
      }
    } catch (e) {
      if (emit.isDone) return;
      emit(BookError('Erro ao buscar livros. Tente novamente.'));
    }
  }

  void _onClear(BookSearchCleared event, Emitter<BookState> emit) {
    _debounce?.cancel();
    emit(BookInitial());
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
