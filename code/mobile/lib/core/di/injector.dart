import 'package:biblioo/core/network/dio_client.dart';
import 'package:biblioo/core/network/auth_interceptor.dart';
import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_event.dart';
import 'package:biblioo/features/auth/data/auth_local_datasource.dart';
import 'package:biblioo/features/auth/data/auth_remote_datasource.dart';
import 'package:biblioo/features/auth/data/auth_repository.dart';
import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/book/data/book_local_datasource.dart';
import 'package:biblioo/features/book/data/book_remote_datasource.dart';
import 'package:biblioo/features/book/data/book_repository.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/data/shelf_local_datasource.dart';
import 'package:biblioo/features/shelf/data/shelf_remote_datasource.dart';
import 'package:biblioo/features/shelf/data/shelf_repository.dart';
import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/data/collection_local_datasource.dart';
import 'package:biblioo/features/collection/data/collection_remote_datasource.dart';
import 'package:biblioo/features/collection/data/collection_repository.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/data/user_local_datasource.dart';
import 'package:biblioo/features/user/data/user_remote_datasource.dart';
import 'package:biblioo/features/user/data/user_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Injector {
  final SharedPreferences _prefs;
  final Dio _dio;

  Injector._(this._prefs, this._dio);

  static Future<Injector> init() async {
    final prefs = await SharedPreferences.getInstance();
    final dio = createDio();

    // Wire auth token injection + refresh/retry for protected endpoints.
    final authLocal = AuthLocalDatasource(prefs);
    final authRemote = AuthRemoteDatasource(dio);
    dio.interceptors.add(AuthInterceptor(authLocal, authRemote, dio));

    return Injector._(prefs, dio);
  }

  // ── auth ──────────────────────────────────────────────
  AuthLocalDatasource get _authLocal => AuthLocalDatasource(_prefs);
  AuthRemoteDatasource get _authRemote => AuthRemoteDatasource(_dio);
  AuthRepository get authRepo => AuthRepository(_authRemote, _authLocal);

  // ── user ──────────────────────────────────────────────
  UserLocalDatasource get _userLocal => UserLocalDatasource(_prefs);
  UserRemoteDatasource get _userRemote => UserRemoteDatasource(_dio);
  UserRepository get userRepo => UserRepository(_userRemote, _userLocal);

  // ── book ──────────────────────────────────────────────
  BookLocalDatasource get _bookLocal => BookLocalDatasource(_prefs);
  BookRemoteDatasource get _bookRemote => BookRemoteDatasource(_dio);
  BookRepository get bookRepo => BookRepository(_bookRemote, _bookLocal);

  // ── shelf ─────────────────────────────────────────────
  ShelfLocalDatasource get _shelfLocal => ShelfLocalDatasource(_prefs);
  ShelfRemoteDatasource get _shelfRemote => ShelfRemoteDatasource(_dio);
  ShelfRepository get shelfRepo => ShelfRepository(_shelfRemote, _shelfLocal);

  // ── collection ────────────────────────────────────────
  CollectionLocalDatasource get _collectionLocal => CollectionLocalDatasource(_prefs);
  CollectionRemoteDatasource get _collectionRemote => CollectionRemoteDatasource(_dio);
  CollectionRepository get collectionRepo => CollectionRepository(_collectionRemote, _collectionLocal);

  // ── providers ─────────────────────────────────────────
  List<BlocProvider> get providers => [
    BlocProvider<AuthBloc>(
      create: (_) => AuthBloc(authRepo)..add(AuthStarted()),
    ),
    BlocProvider<UserBloc>(create: (_) => UserBloc(userRepo)),
    BlocProvider<BookBloc>(create: (_) => BookBloc(bookRepo)),
    BlocProvider<ShelfBloc>(create: (_) => ShelfBloc(shelfRepo)),
    BlocProvider<CollectionBloc>(create: (_) => CollectionBloc(collectionRepo)),
  ];
}

