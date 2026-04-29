import 'package:biblioo/core/network/dio_client.dart';
import 'package:biblioo/core/network/auth_interceptor.dart';
import 'package:biblioo/core/network/retry_interceptor.dart';
import 'package:biblioo/core/theme/theme_mode_cubit.dart';
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
import 'package:biblioo/features/community/data/community_local_datasource.dart';
import 'package:biblioo/features/community/data/community_remote_datasource.dart';
import 'package:biblioo/features/community/data/community_repository.dart';
import 'package:biblioo/features/notification/bloc/notification_bloc.dart';
import 'package:biblioo/features/notification/data/notification_remote_datasource.dart';
import 'package:biblioo/features/notification/data/notification_repository.dart';
import 'package:biblioo/features/user/bloc/user_search_bloc.dart';
import 'package:biblioo/features/user/data/user_local_datasource.dart';
import 'package:biblioo/features/user/data/user_remote_datasource.dart';
import 'package:biblioo/features/user/data/user_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Injector {
  static late Injector instance;

  final SharedPreferences _prefs;
  final Dio _dio;

  Injector._(this._prefs, this._dio);

  static Future<Injector> init() async {
    final prefs = await SharedPreferences.getInstance();
    final dio = createDio();

    dio.interceptors.add(RetryInterceptor(dio));

    final authLocal = AuthLocalDatasource(prefs);
    final authRemote = AuthRemoteDatasource(dio);
    dio.interceptors.add(AuthInterceptor(authLocal, authRemote, dio));

    instance = Injector._(prefs, dio);
    return instance;
  }

  // ── auth ──────────────────────────────────────────────
  AuthLocalDatasource get authLocal => AuthLocalDatasource(_prefs);
  AuthRemoteDatasource get _authRemote => AuthRemoteDatasource(_dio);
  AuthRepository get authRepo => AuthRepository(_authRemote, authLocal);

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
  CollectionLocalDatasource get _collectionLocal =>
      CollectionLocalDatasource(_prefs);
  CollectionRemoteDatasource get _collectionRemote =>
      CollectionRemoteDatasource(_dio);
  CollectionRepository get collectionRepo =>
      CollectionRepository(_collectionRemote, _collectionLocal);

  // ── community ─────────────────────────────────────────
  CommunityLocalDatasource get _communityLocal =>
      CommunityLocalDatasource(_prefs);
  CommunityRemoteDatasource get _communityRemote =>
      CommunityRemoteDatasource(_dio);
  CommunityRepository get communityRepo =>
      CommunityRepository(_communityRemote, _communityLocal);

  // ── notification ─────────────────────────────────────
  NotificationRemoteDatasource get _notificationRemote =>
      NotificationRemoteDatasource(_dio);
  NotificationRepository get notificationRepo =>
      NotificationRepository(_notificationRemote);

  // ── providers ─────────────────────────────────────────
  List<BlocProvider> get providers => [
    BlocProvider<ThemeModeCubit>(create: (_) => ThemeModeCubit(_prefs)),
    BlocProvider<AuthBloc>(
      create: (_) => AuthBloc(authRepo)..add(AuthStarted()),
    ),
    BlocProvider<UserBloc>(create: (_) => UserBloc(userRepo)),
    BlocProvider<UserSearchBloc>(create: (_) => UserSearchBloc(userRepo)),
    BlocProvider<BookBloc>(create: (_) => BookBloc(bookRepo)),
    BlocProvider<ShelfBloc>(create: (_) => ShelfBloc(shelfRepo)),
    BlocProvider<CollectionBloc>(create: (_) => CollectionBloc(collectionRepo)),
    BlocProvider<NotificationBloc>(
      create: (_) => NotificationBloc(notificationRepo),
    ),
  ];
}
