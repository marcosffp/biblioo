import 'package:flutter/material.dart';

class AppTheme {
  // Frontend design-tokens (tokens.css)
  static const _bgCanvas = Color(0xFFF4FBF9);
  static const _bgSurface = Color(0xFFFFFFFF);
  static const _bgSoft = Color(0xFFEEFBF7);
  static const _brand500 = Color(0xFF3FC3A7);
  static const _brand600 = Color(0xFF13937A);
  static const _brand100 = Color(0xFFC9F4E8);
  static const _textPrimary = Color(0xFF0F2F2C);
  static const _textSecondary = Color(0xFF4C6F69);
  static const _borderSoft = Color(0xFFD5E9E6);

  static const _radiusMd = 12.0;

  static const _lightScheme = ColorScheme(
    brightness: Brightness.light,
    primary: _brand500,
    onPrimary: Colors.white,
    primaryContainer: _brand100,
    onPrimaryContainer: _textPrimary,
    secondary: _brand600,
    onSecondary: Colors.white,
    secondaryContainer: _bgSoft,
    onSecondaryContainer: _textPrimary,
    tertiary: _brand600,
    onTertiary: Colors.white,
    tertiaryContainer: _bgSoft,
    onTertiaryContainer: _textPrimary,
    error: Color(0xFFB3261E),
    onError: Colors.white,
    errorContainer: Color(0xFFF9DEDC),
    onErrorContainer: Color(0xFF410E0B),
    surface: _bgSurface,
    onSurface: _textPrimary,
    onSurfaceVariant: _textSecondary,
    outline: _borderSoft,
    outlineVariant: _bgSoft,
    shadow: Color(0x1A122016),
    scrim: Colors.black,
    inverseSurface: _textPrimary,
    onInverseSurface: _bgSurface,
    inversePrimary: _brand100,
    surfaceContainerHighest: _bgSoft,
  );

  static const _darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFF3FC3A7),
    onPrimary: Color(0xFF00261E),
    primaryContainer: Color(0xFF13937A),
    onPrimaryContainer: Color(0xFFC9F4E8),
    secondary: Color(0xFF5ECDB5),
    onSecondary: Color(0xFF00261E),
    secondaryContainer: Color(0xFF0A4A3C),
    onSecondaryContainer: Color(0xFFC9F4E8),
    tertiary: Color(0xFF7FD8C4),
    onTertiary: Color(0xFF00261E),
    tertiaryContainer: Color(0xFF0A4A3C),
    onTertiaryContainer: Color(0xFFC9F4E8),
    error: Color(0xFFFFB4AB),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: Color(0xFF0D1F1C),
    onSurface: Color(0xFFE0F5F1),
    onSurfaceVariant: Color(0xFFAAC9C4),
    outline: Color(0xFF4C7A73),
    outlineVariant: Color(0xFF1E3D38),
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: Color(0xFFE0F5F1),
    onInverseSurface: Color(0xFF0D1F1C),
    inversePrimary: _brand600,
    surfaceContainerHighest: Color(0xFF1A2E2A),
  );

  static final light = ThemeData(
    useMaterial3: true,
    colorScheme: _lightScheme,
    scaffoldBackgroundColor: _bgCanvas,
    cardTheme: const CardThemeData(color: _bgSurface),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _bgSoft,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: _borderSoft),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: _brand500, width: 1.5),
      ),
      hintStyle: const TextStyle(color: _textSecondary),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: _brand500,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radiusMd),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: _brand600,
        side: const BorderSide(color: _borderSoft),
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radiusMd),
        ),
      ),
    ),
  );

  static final dark = ThemeData(
    useMaterial3: true,
    colorScheme: _darkScheme,
    scaffoldBackgroundColor: const Color(0xFF101813),
    cardTheme: const CardThemeData(color: Color(0xFF1E2A22)),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF1E2A22),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: Color(0xFF324338)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: Color(0xFF7FD28B), width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: _brand500,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radiusMd),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFFA5D7AF),
        side: const BorderSide(color: Color(0xFF5E7263)),
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radiusMd),
        ),
      ),
    ),
  );
}
