import 'package:biblioo/features/book/domain/book.dart';

abstract class BookState {}

class BookInitial extends BookState {}

class BookLoading extends BookState {}

class BookLoaded extends BookState {
  final List<Book> books;
  BookLoaded(this.books);
}

class BookEmpty extends BookState {
  final String query;
  BookEmpty(this.query);
}

class BookError extends BookState {
  final String message;
  BookError(this.message);
}
