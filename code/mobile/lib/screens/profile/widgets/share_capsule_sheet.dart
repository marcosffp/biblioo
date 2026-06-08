import 'dart:io';
import 'dart:typed_data';

import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/share/bloc/share_bloc.dart';
import 'package:biblioo/features/share/bloc/share_event.dart';
import 'package:biblioo/features/share/bloc/share_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> showShareCapsuleSheet(
  BuildContext context, {
  required int userId,
  required String userName,
  required String userHandle,
  required String? avatarUrl,
  required int booksRead,
  required int pagesRead,
}) async {
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) {
      return ShareCapsuleSheet(
        userId: userId,
        userName: userName,
        userHandle: userHandle,
        avatarUrl: avatarUrl,
        booksRead: booksRead,
        pagesRead: pagesRead,
      );
    },
  );
}

class ShareCapsuleSheet extends StatefulWidget {
  final int userId;
  final String userName;
  final String userHandle;
  final String? avatarUrl;
  final int booksRead;
  final int pagesRead;

  const ShareCapsuleSheet({
    super.key,
    required this.userId,
    required this.userName,
    required this.userHandle,
    required this.avatarUrl,
    required this.booksRead,
    required this.pagesRead,
  });

  @override
  State<ShareCapsuleSheet> createState() => _ShareCapsuleSheetState();
}

class _ShareCapsuleSheetState extends State<ShareCapsuleSheet> {
  bool _sharing = false;
  late final ShareBloc _bloc;

  @override
  void initState() {
    super.initState();
    _bloc = ShareBloc(Injector.instance.shareRepo)
      ..add(ShareCapsuleRequested(userId: widget.userId));
  }

  @override
  void dispose() {
    _bloc.close();
    super.dispose();
  }

  Future<File> _writeTempFile(Uint8List bytes) async {
    final tempDir = await getTemporaryDirectory();
    final file = File(
      '${tempDir.path}/biblioo-capsula-${DateTime.now().millisecondsSinceEpoch}.png',
    );
    await file.writeAsBytes(bytes, flush: true);
    return file;
  }

  Future<void> _shareCapsule(
    BuildContext context,
    Uint8List bytes,
    String destination,
  ) async {
    if (_sharing) return;

    final renderBox = context.findRenderObject();
    final overlayBox = Navigator.of(
      context,
    ).overlay?.context.findRenderObject();
    final shareOrigin = renderBox is RenderBox && renderBox.hasSize
        ? renderBox.localToGlobal(Offset.zero) & renderBox.size
        : overlayBox is RenderBox && overlayBox.hasSize
        ? overlayBox.localToGlobal(Offset.zero) & overlayBox.size
        : const Rect.fromLTWH(0, 0, 1, 1);

    setState(() => _sharing = true);
    try {
      final file = await _writeTempFile(bytes);
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'image/png', name: 'biblioo-capsula.png')],
        subject: 'Capsula Literaria - Biblioo',
        text:
            'Minha Capsula Literaria no Biblioo\n'
            '${widget.booksRead} livros lidos - ${widget.pagesRead} paginas lidas\n'
            '${widget.userHandle}\n'
            'Compartilhar via $destination',
        sharePositionOrigin: shareOrigin,
      );
    } finally {
      if (mounted) {
        setState(() => _sharing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocProvider.value(
      value: _bloc,
      child: BlocBuilder<ShareBloc, ShareState>(
        builder: (context, state) {
          final isLoading = state is ShareLoading || state is ShareInitial;
          final errorMessage = state is ShareError ? state.message : null;
          final capsule = state is ShareLoaded ? state.capsule : null;
          final bytes = capsule?.bytes;

          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.92,
            minChildSize: 0.72,
            maxChildSize: 0.96,
            builder: (context, scrollController) {
              return Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(28),
                  ),
                ),
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 44,
                          height: 5,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.outlineVariant,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Compartilhar capsula',
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Abra o seletor do sistema para enviar a imagem.',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.of(context).pop(),
                            icon: const Icon(Icons.close),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primaryContainer,
                              theme.colorScheme.surfaceContainerHighest,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(28),
                        ),
                        padding: const EdgeInsets.all(6),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(22),
                          child: isLoading
                              ? const SizedBox(
                                  height: 200,
                                  child: Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                )
                              : errorMessage != null
                              ? _ShareErrorState(
                                  message: errorMessage,
                                  onRetry: () => context.read<ShareBloc>().add(
                                    ShareCapsuleRequested(
                                      userId: widget.userId,
                                      refreshRemote: true,
                                    ),
                                  ),
                                )
                              : bytes == null
                              ? const SizedBox.shrink()
                              : Image.memory(
                                  bytes,
                                  width: double.infinity,
                                  fit: BoxFit.fitWidth,
                                  filterQuality: FilterQuality.high,
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed:
                              (isLoading ||
                                  errorMessage != null ||
                                  _sharing ||
                                  bytes == null)
                              ? null
                              : () => _shareCapsule(
                                  context,
                                  bytes,
                                  'seletor do sistema',
                                ),
                          icon: const Icon(Icons.ios_share_outlined),
                          label: Text(
                            _sharing
                                ? 'Compartilhando...'
                                : 'Compartilhar agora',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ShareErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ShareErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: theme.colorScheme.error, size: 40),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: onRetry,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
