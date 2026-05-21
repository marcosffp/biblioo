import 'package:shared_preferences/shared_preferences.dart';

class PreferencesLocalDatasource {
  static const _keyOnboarding = 'biblioo.onboarding.completed';

  final SharedPreferences _prefs;
  const PreferencesLocalDatasource(this._prefs);

  bool isOnboardingDone() => _prefs.getBool(_keyOnboarding) ?? false;

  Future<void> markOnboardingDone() => _prefs.setBool(_keyOnboarding, true);

  Future<void> clearOnboarding() => _prefs.remove(_keyOnboarding);
}
