import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:biblioo/core/router/app_router.dart';

class DeepLinkHandler extends StatefulWidget {
  final Widget child;
  const DeepLinkHandler({super.key, required this.child});

  @override
  State<DeepLinkHandler> createState() => _DeepLinkHandlerState();
}

class _DeepLinkHandlerState extends State<DeepLinkHandler> {
  late final AppLinks _appLinks;
  StreamSubscription<Uri>? _sub;

  @override
  void initState() {
    super.initState();
    _appLinks = AppLinks();
    _initLinks();
  }

  Future<void> _initLinks() async {
    try {
      final initial = await _appLinks.getInitialLink();
      if (initial != null) {
        _handleUri(initial);
      }
    } catch (e) {
      debugPrint('Deep link initial error: $e');
    }

    _sub = _appLinks.uriLinkStream.listen(
      _handleUri,
      onError: (error) => debugPrint('Deep link stream error: $error'),
    );
  }

  void _handleUri(Uri uri) {
    if (uri.scheme != 'biblioo') return;

    if (uri.host == 'reset-password') {
      final token = uri.queryParameters['token'];
      final target = token != null && token.isNotEmpty
          ? '/forgot-password?token=${Uri.encodeComponent(token)}'
          : '/forgot-password';
      appRouter.go(target);
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
