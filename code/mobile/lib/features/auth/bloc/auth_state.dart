import 'package:biblioo/features/auth/domain/auth_session.dart';

abstract class AuthState {}
class AuthInitial         extends AuthState {}
class AuthLoading         extends AuthState {}
class AuthUnauthenticated extends AuthState {}
class AuthAuthenticated   extends AuthState {
  final AuthSession session;
  AuthAuthenticated(this.session);
}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}