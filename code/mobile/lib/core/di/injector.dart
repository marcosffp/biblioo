import 'package:biblioo/core/network/dio_client.dart';
import 'package:biblioo/core/network/auth_interceptor.dart';
import 'package:biblioo/core/network/retry_interceptor.dart';
import 'package:biblioo/core/theme/theme_mode_cubit.dart';
import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_event.dart';
import 'package:biblioo/features/auth/data/auth_local_datasource.dart';
import 'package:biblioo/features/auth/data/auth_remote_datasource.dart';
import 'package:biblioo/features/auth/data/auth_secure_datasource.dart';
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
import 'package:biblioo/features/feed/bloc/feed_bloc.dart';
import 'package:biblioo/features/feed/bloc/post_bloc.dart';
import 'package:biblioo/features/feed/bloc/review_bloc.dart';
import 'package:biblioo/features/feed/data/feed_local_datasource.dart';
import 'package:biblioo/features/feed/data/feed_remote_datasource.dart';
import 'package:biblioo/features/feed/data/feed_repository.dart';
import 'package:biblioo/features/notification/bloc/notification_bloc.dart';
import 'package:biblioo/features/notification/data/notification_remote_datasource.dart';
import 'package:biblioo/features/notification/data/notification_repository.dart';
import 'package:biblioo/features/recommendation/bloc/recommendation_bloc.dart';
import 'package:biblioo/features/recommendation/data/recommendation_local_datasource.dart';
import 'package:biblioo/features/recommendation/data/recommendation_remote_datasource.dart';
import 'package:biblioo/features/recommendation/data/recommendation_repository.dart';
import 'package:biblioo/features/preferences/data/preferences_local_datasource.dart';
import 'package:biblioo/features/preferences/data/preferences_remote_datasource.dart';
import 'package:biblioo/features/preferences/data/preferences_repository.dart';
import 'package:biblioo/features/dna/data/dna_local_datasource.dart';
import 'package:biblioo/features/dna/data/dna_remote_datasource.dart';
import 'package:biblioo/features/dna/data/dna_repository.dart';
import 'package:biblioo/features/assistant/bloc/assistant_bloc.dart';
import 'package:biblioo/features/assistant/data/assistant_local_datasource.dart';
import 'package:biblioo/features/assistant/data/assistant_remote_datasource.dart';
import 'package:biblioo/features/assistant/data/assistant_repository.dart';
import 'package:biblioo/features/user/bloc/user_search_bloc.dart';
import 'package:biblioo/features/user/data/user_local_datasource.dart';
import 'package:biblioo/features/user/data/user_remote_datasource.dart';
import 'package:biblioo/features/user/data/user_repository.dart';
import 'package:biblioo/features/share/data/share_local_datasource.dart';
import 'package:biblioo/features/share/data/share_remote_datasource.dart';
import 'package:biblioo/features/share/data/share_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Injector {
  static late Injector instance;

  final SharedPreferences _prefs;
  final FlutterSecureStorage _secureStorage;
  final Dio _dio;

  late final AuthBloc authBloc;

  Injector._(this._prefs, this._secureStorage, this._dio);

  Dio get dio => _dio;

  static Future<Injector> init() async {
    final prefs = await SharedPreferences.getInstance();
    const secureStorage = FlutterSecureStorage();
    final dio = createDio();

    dio.interceptors.add(RetryInterceptor(dio));

    final authLocal = AuthLocalDatasource(prefs);
    final authSecure = AuthSecureDatasource(secureStorage);
    final authRemote = AuthRemoteDatasource(dio);
    dio.interceptors.add(
      AuthInterceptor(authLocal, authSecure, authRemote, dio),
    );

    final injector = Injector._(prefs, secureStorage, dio);
    injector.authBloc = AuthBloc(injector.authRepo)..add(AuthStarted());
    instance = injector;
    return instance;
  }

  // ── auth ──────────────────────────────────────────────
  AuthLocalDatasource get authLocal => AuthLocalDatasource(_prefs);
  AuthSecureDatasource get authSecure => AuthSecureDatasource(_secureStorage);
  AuthRemoteDatasource get _authRemote => AuthRemoteDatasource(_dio);
  AuthRepository get authRepo =>
      AuthRepository(_authRemote, authLocal, authSecure);

  // ── user ──────────────────────────────────────────────
  UserLocalDatasource get _userLocal => UserLocalDatasource(_prefs);
  UserRemoteDatasource get _userRemote => UserRemoteDatasource(_dio);
  UserRepository get userRepo =>
      UserRepository(_userRemote, _userLocal, authLocal);

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
      CommunityRepository(_communityRemote, _communityLocal, bookRepo);

  FeedLocalDatasource get _feedLocal => FeedLocalDatasource(_prefs);
  FeedRemoteDatasource get _feedRemote => FeedRemoteDatasource(_dio);
  FeedRepository get feedRepo => FeedRepository(_feedRemote, _feedLocal);

  // ── dna ───────────────────────────────────────────────
  DnaLocalDatasource get _dnaLocal => DnaLocalDatasource(_prefs);
  DnaRemoteDatasource get _dnaRemote => DnaRemoteDatasource(_dio);
  DnaRepository get dnaRepo => DnaRepository(_dnaRemote, _dnaLocal);

  // ── notification ─────────────────────────────────────
  NotificationRemoteDatasource get _notificationRemote =>
      NotificationRemoteDatasource(_dio);
  NotificationRepository get notificationRepo =>
      NotificationRepository(_notificationRemote);

  // ── recommendation ───────────────────────────────────
  RecommendationLocalDatasource get _recommendationLocal =>
      RecommendationLocalDatasource(_prefs);
  RecommendationRemoteDatasource get _recommendationRemote =>
      RecommendationRemoteDatasource(_dio);
  RecommendationRepository get recommendationRepo =>
      RecommendationRepository(_recommendationRemote, _recommendationLocal);

  // ── preferences ──────────────────────────────────────
  PreferencesLocalDatasource get _preferencesLocal =>
      PreferencesLocalDatasource(_prefs);
  PreferencesRemoteDatasource get _preferencesRemote =>
      PreferencesRemoteDatasource(_dio);
  PreferencesRepository get preferencesRepo =>
      PreferencesRepository(_preferencesRemote, _preferencesLocal);

  // ── assistant ─────────────────────────────────────────
  AssistantLocalDatasource get _assistantLocal =>
      AssistantLocalDatasource(_prefs);
  AssistantRemoteDatasource get _assistantRemote =>
      AssistantRemoteDatasource(_dio);
  AssistantRepository get assistantRepo =>
      AssistantRepository(_assistantRemote, _assistantLocal);

  // ── share ──────────────────────────────────────────────
  ShareLocalDatasource get _shareLocal => ShareLocalDatasource(_prefs);
  ShareRemoteDatasource get _shareRemote => ShareRemoteDatasource(_dio);
  ShareRepository get shareRepo => ShareRepository(_shareRemote, _shareLocal);

  // ── providers ─────────────────────────────────────────
  List<BlocProvider> get providers => [
    BlocProvider<ThemeModeCubit>(create: (_) => ThemeModeCubit(_prefs)),
    BlocProvider<AuthBloc>.value(value: authBloc),
    BlocProvider<UserBloc>(create: (_) => UserBloc(userRepo)),
    BlocProvider<UserSearchBloc>(create: (_) => UserSearchBloc(userRepo)),
    BlocProvider<BookBloc>(create: (_) => BookBloc(bookRepo)),
    BlocProvider<ShelfBloc>(create: (_) => ShelfBloc(shelfRepo)),
    BlocProvider<CollectionBloc>(create: (_) => CollectionBloc(collectionRepo)),
    BlocProvider<FeedBloc>(create: (_) => FeedBloc(feedRepo)),
    BlocProvider<ReviewBloc>(create: (_) => ReviewBloc(feedRepo)),
    BlocProvider<PostBloc>(create: (_) => PostBloc(feedRepo)),
    BlocProvider<NotificationBloc>(
      create: (_) => NotificationBloc(notificationRepo),
    ),
    BlocProvider<AssistantBloc>(create: (_) => AssistantBloc(assistantRepo)),
    BlocProvider<RecommendationBloc>(
      create: (_) => RecommendationBloc(recommendationRepo),
    ),
  ];
}
