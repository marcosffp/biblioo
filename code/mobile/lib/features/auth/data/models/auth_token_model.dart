class AuthTokenModel {
  final String accessToken;
  final String refreshToken;

  const AuthTokenModel({
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthTokenModel.fromJson(Map<String, dynamic> json) => AuthTokenModel(
    accessToken: json['accessToken'] as String,
    refreshToken: json['refreshToken'] as String,
  );
}