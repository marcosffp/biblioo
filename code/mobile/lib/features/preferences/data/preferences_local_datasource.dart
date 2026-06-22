import 'package:shared_preferences/shared_preferences.dart';

class PreferencesLocalDatasource {
  final SharedPreferences _prefs;
  const PreferencesLocalDatasource(this._prefs);

  String _keyFor(int userId) => 'biblioo.onboarding.completed.$userId';

  bool isOnboardingDone(int userId) =>
      _prefs.getBool(_keyFor(userId)) ?? false;

  Future<void> markOnboardingDone(int userId) =>
      _prefs.setBool(_keyFor(userId), true);

  Future<void> clearOnboarding(int userId) => _prefs.remove(_keyFor(userId));
}
