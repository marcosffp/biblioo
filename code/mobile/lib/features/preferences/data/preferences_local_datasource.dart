import 'package:shared_preferences/shared_preferences.dart';

class PreferencesLocalDatasource {
  static const _keyPrefix = 'biblioo.onboarding.completed.';

  final SharedPreferences _prefs;
  const PreferencesLocalDatasource(this._prefs);

  String _key(int userId) => '$_keyPrefix$userId';

  bool isOnboardingDone(int userId) => _prefs.getBool(_key(userId)) ?? false;

  Future<void> markOnboardingDone(int userId) =>
      _prefs.setBool(_key(userId), true);

  Future<void> clearOnboarding(int userId) => _prefs.remove(_key(userId));
}
