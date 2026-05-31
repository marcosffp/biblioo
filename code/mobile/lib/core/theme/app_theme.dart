import 'package:flutter/material.dart';

class AppTheme {
  // Espelha os design-tokens do front (code/front/src/design-tokens/tokens.css).
  // Paleta oficial: teal/menta (não verde-floresta).
  static const _bgCanvas = Color(0xFFF4FBF9);     // --bg-canvas
  static const _bgSurface = Color(0xFFFFFFFF);    // --bg-surface / --card
  static const _bgSoft = Color(0xFFEEFBF7);       // --bg-soft
  static const _bgMuted = Color(0xFFECF3F1);      // --muted
  static const _brand500 = Color(0xFF3FC3A7);     // --brand-500
  static const _brand600 = Color(0xFF13937A);     // --brand-600
  static const _brand100 = Color(0xFFC9F4E8);     // --brand-100
  static const _brandAccent = Color(0xFF58E4C8);  // --accent (HSL 168 72% 62%)
  static const _textPrimary = Color(0xFF0F2F2C);  // --text-primary
  static const _textSecondary = Color(0xFF4C6F69); // --text-secondary
  static const _borderSoft = Color(0xFFDBE6E2);   // --border (HSL 160 18% 88%)
  static const _focusRing = Color(0xFF81D5B5);    // --ring

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
    tertiary: _brandAccent,
    onTertiary: _textPrimary,
    tertiaryContainer: _bgSoft,
    onTertiaryContainer: _textPrimary,
    error: Color(0xFFE16767),
    onError: Colors.white,
    errorContainer: Color(0xFFFADBDB),
    onErrorContainer: Color(0xFF410E0B),
    surface: _bgSurface,
    onSurface: _textPrimary,
    onSurfaceVariant: _textSecondary,
    outline: _borderSoft,
    outlineVariant: _bgMuted,
    shadow: Color(0x1A0F2F2C),
    scrim: Colors.black,
    inverseSurface: _textPrimary,
    onInverseSurface: _bgSurface,
    inversePrimary: _brand100,
    surfaceContainerHighest: _bgMuted,
  );

  // Tons teal equivalentes para o dark, derivados da mesma família do --primary.
  static const _darkBg = Color(0xFF0F1A17);
  static const _darkSurfaceHigh = Color(0xFF1E2A26);
  static const _darkOnSurface = Color(0xFFE1EFE9);
  static const _darkOnSurfaceVariant = Color(0xFFB1C5BD);
  static const _darkOutline = Color(0xFF5E7270);
  static const _darkOutlineVariant = Color(0xFF324340);
  static const _darkPrimary = Color(0xFF7FD2BC);
  static const _darkPrimaryContainer = Color(0xFF125748);
  static const _darkSecondary = Color(0xFF8FC9B8);

  static const _darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: _darkPrimary,
    onPrimary: Color(0xFF003827),
    primaryContainer: _darkPrimaryContainer,
    onPrimaryContainer: Color(0xFFC5F2E0),
    secondary: _darkSecondary,
    onSecondary: Color(0xFF133629),
    secondaryContainer: Color(0xFF244A3F),
    onSecondaryContainer: Color(0xFFCBEEDF),
    tertiary: Color(0xFFA5D7C6),
    onTertiary: Color(0xFF123628),
    tertiaryContainer: Color(0xFF244A3F),
    onTertiaryContainer: Color(0xFFD8F5E6),
    error: Color(0xFFFFB4AB),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: _darkBg,
    onSurface: _darkOnSurface,
    onSurfaceVariant: _darkOnSurfaceVariant,
    outline: _darkOutline,
    outlineVariant: _darkOutlineVariant,
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: _darkOnSurface,
    onInverseSurface: Color(0xFF19251F),
    inversePrimary: _brand500,
    surfaceContainerHighest: _darkSurfaceHigh,
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
        borderSide: const BorderSide(color: _focusRing, width: 1.5),
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
    scaffoldBackgroundColor: _darkBg,
    cardTheme: const CardThemeData(color: _darkSurfaceHigh),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _darkSurfaceHigh,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: _darkOutlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(_radiusMd),
        borderSide: const BorderSide(color: _darkPrimary, width: 1.5),
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
        foregroundColor: Color(0xFFA5D7C6),
        side: const BorderSide(color: _darkOutline),
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radiusMd),
        ),
      ),
    ),
  );
}
