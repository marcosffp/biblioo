import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeModeCubit extends Cubit<ThemeMode> {
  static const _prefsKey = 'app_theme_mode';
  final SharedPreferences _prefs;

  ThemeModeCubit(this._prefs) : super(_readMode(_prefs));

  static ThemeMode _readMode(SharedPreferences prefs) {
    final raw = prefs.getString(_prefsKey);
    switch (raw) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> setMode(ThemeMode mode) async {
    if (state == mode) return;
    emit(mode);
    await _prefs.setString(_prefsKey, mode.name);
  }
}
