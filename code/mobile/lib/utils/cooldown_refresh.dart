import 'dart:async';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

class CooldownManager {
  CooldownManager._internal();
  static final CooldownManager instance = CooldownManager._internal();
  static const String _prefixKey = 'cooldown_';

  final Map<String, _CooldownState> _states = {};
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
    _loadFromPrefs();
  }

  void _loadFromPrefs() {
    if (_prefs == null) return;
    for (final key in _prefs!.getKeys()) {
      if (!key.startsWith(_prefixKey)) continue;
      final stateKey = key.substring(_prefixKey.length);
      final data = _prefs!.getString(key);
      if (data == null) continue;
      try {
        final parts = data.split('|');
        final attempts = int.tryParse(parts[0]) ?? 1;
        final expiryMs = int.tryParse(parts[1]);
        final expiry = expiryMs != null
            ? DateTime.fromMillisecondsSinceEpoch(expiryMs)
            : null;
        _states[stateKey] = _CooldownState()
          ..attempts = attempts
          ..expiry = expiry;
      } catch (_) {
        // ignore malformed entries
      }
    }
  }

  Future<void> _saveToPrefs(String key) async {
    if (_prefs == null) await init();
    final state = _states[key];
    if (state == null) {
      await _prefs!.remove('$_prefixKey$key');
      return;
    }
    final data =
        '${state.attempts}|${state.expiry?.millisecondsSinceEpoch ?? ''}';
    await _prefs!.setString('$_prefixKey$key', data);
  }

  bool isInCooldown(String key) {
    final s = _states[key];
    if (s == null) return false;
    final expiry = s.expiry;
    if (expiry == null) return false;
    return expiry.isAfter(DateTime.now());
  }

  int remainingSeconds(String key) {
    final s = _states[key];
    if (s == null || s.expiry == null) return 0;
    final diff = s.expiry!.difference(DateTime.now()).inSeconds;
    return diff > 0 ? diff : 0;
  }

  int attempts(String key) => _states[key]?.attempts ?? 1;

  /// Record a refresh attempt for [key]. Returns cooldown seconds (0 = no cooldown).
  int recordAttempt(String key, {int baseSeconds = 2, int maxSeconds = 120}) {
    final now = DateTime.now();
    final state = _states.putIfAbsent(key, () => _CooldownState());
    state.attempts = (state.attempts) + 1;

    // attempts <= 2: allow immediate second refresh
    final att = state.attempts;
    if (att <= 2) {
      state.expiry = null;
      _saveToPrefs(key);
      return 0;
    }

    final power = att - 3; // att==3 -> power=0 -> baseSeconds
    final secs = (baseSeconds * (1 << power)).clamp(0, maxSeconds);
    state.expiry = now.add(Duration(seconds: secs));
    _saveToPrefs(key);
    return secs;
  }

  void reset(String key) {
    _states.remove(key);
    _saveToPrefs(key);
  }
}

class _CooldownState {
  int attempts = 1;
  DateTime? expiry;

  _CooldownState();
}

class CooldownRefreshIndicator extends StatefulWidget {
  final String keyId;
  final Future<void> Function() onRefresh;
  final Widget child;

  const CooldownRefreshIndicator({
    Key? key,
    required this.keyId,
    required this.onRefresh,
    required this.child,
  }) : super(key: key);

  @override
  State<CooldownRefreshIndicator> createState() =>
      _CooldownRefreshIndicatorState();
}

class _CooldownRefreshIndicatorState extends State<CooldownRefreshIndicator> {
  Timer? _ticker;
  int _remaining = 0;

  @override
  void initState() {
    super.initState();
    _syncTicker();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _syncTicker() {
    _ticker?.cancel();
    if (!CooldownManager.instance.isInCooldown(widget.keyId)) return;
    setState(() {
      _remaining = CooldownManager.instance.remainingSeconds(widget.keyId);
    });
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      final rem = CooldownManager.instance.remainingSeconds(widget.keyId);
      if (rem <= 0) {
        _ticker?.cancel();
      }
      if (mounted) {
        setState(() {
          _remaining = rem;
        });
      }
    });
  }

  Future<void> _onRefreshWrapper() async {
    final manager = CooldownManager.instance;
    if (manager.isInCooldown(widget.keyId)) {
      final secs = manager.remainingSeconds(widget.keyId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Aguarde $secs s antes de recarregar novamente.'),
        ),
      );
      return;
    }

    final cooldown = manager.recordAttempt(widget.keyId);
    if (cooldown > 0) {
      _syncTicker();
    }

    try {
      await widget.onRefresh();
      // on success reset attempts/cooldown
      manager.reset(widget.keyId);
      if (mounted) setState(() => _remaining = 0);
    } catch (e) {
      // keep cooldown if present
      rethrow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        RefreshIndicator(onRefresh: _onRefreshWrapper, child: widget.child),
        if (CooldownManager.instance.isInCooldown(widget.keyId))
          Positioned(
            top: 8,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Theme.of(
                    context,
                  ).colorScheme.surface.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: Text('Aguarde $_remaining s para recarregar'),
              ),
            ),
          ),
      ],
    );
  }
}
