abstract class AuthEvent {}

class AuthStarted extends AuthEvent {} // verifica sessão salva no boot

class LoginRequested extends AuthEvent {
  final String email, password;
  LoginRequested(this.email, this.password);
}

class LoginWithGoogleRequested extends AuthEvent {
  final String idToken;
  LoginWithGoogleRequested(this.idToken);
}

class RegisterRequested extends AuthEvent {
  final String username, email, password;
  RegisterRequested(this.username, this.email, this.password);
}

class LogoutRequested extends AuthEvent {}
