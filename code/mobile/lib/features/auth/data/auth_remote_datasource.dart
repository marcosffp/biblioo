import 'package:biblioo/features/user/data/models/user_model.dart';
import 'package:dio/dio.dart';
import 'models/auth_token_model.dart';

class AuthRemoteDatasource {
  final Dio _dio;
  const AuthRemoteDatasource(this._dio);

  // POST /auth/login — body: { email, password }
  Future<({AuthTokenModel tokens, UserModel user})> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    return _parseAuthResponse(response.data as Map<String, dynamic>);
  }

  // POST /auth/google — body: { idToken }
  Future<({AuthTokenModel tokens, UserModel user})> loginWithGoogle({
    required String idToken,
  }) async {
    final response = await _dio.post(
      '/auth/google',
      data: {'idToken': idToken},
    );
    return _parseAuthResponse(response.data as Map<String, dynamic>);
  }

  // POST /auth/register — body: { username, email, password }
  Future<({AuthTokenModel tokens, UserModel user})> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {'username': username, 'email': email, 'password': password},
    );
    return _parseAuthResponse(response.data as Map<String, dynamic>);
  }

  // POST /auth/refresh — body: { refreshToken }
  Future<({AuthTokenModel tokens, UserModel user})> refresh(
    String refreshToken,
  ) async {
    final response = await _dio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    return _parseAuthResponse(response.data as Map<String, dynamic>);
  }

  // POST /auth/logout — body: { refreshToken } → 204
  Future<void> logout(String refreshToken) async {
    await _dio.post('/auth/logout', data: {'refreshToken': refreshToken});
  }

  // POST /auth/forgot-password — body: { email }
  Future<String> requestPasswordReset({required String email}) async {
    final response = await _dio.post(
      '/auth/forgot-password',
      data: {'email': email},
      options: Options(headers: const {'X-Client-Type': 'mobile'}),
    );
    final data = response.data as Map<String, dynamic>;
    return (data['message'] as String?) ?? 'Solicitacao enviada com sucesso.';
  }

  // POST /auth/reset-password — body: { token, newPassword, confirmPassword }
  Future<String> resetPassword({
    required String token,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final response = await _dio.post(
      '/auth/reset-password',
      data: {
        'token': token,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return (data['message'] as String?) ?? 'Senha redefinida com sucesso.';
  }

  // GET /users/me — retorna perfil completo do usuário logado
  Future<UserModel> me() async {
    final response = await _dio.get('/users/me');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  ({AuthTokenModel tokens, UserModel user}) _parseAuthResponse(
    Map<String, dynamic> data,
  ) => (
    tokens: AuthTokenModel.fromJson(data),
    user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
  );
}
