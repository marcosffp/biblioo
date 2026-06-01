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
    final overlayBox = Navigator.of(context).overlay?.context.findRenderObject();
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
    final destinations = <_ShareDestination>[
      const _ShareDestination(label: 'WhatsApp', icon: Icons.chat_bubble_outline),
      const _ShareDestination(label: 'Telegram', icon: Icons.send_outlined),
      const _ShareDestination(label: 'Instagram', icon: Icons.camera_alt_outlined),
      const _ShareDestination(label: 'X', icon: Icons.close),
      const _ShareDestination(label: 'TikTok', icon: Icons.music_note_outlined),
      const _ShareDestination(label: 'Mais', icon: Icons.more_horiz),
    ];

    return BlocProvider.value(
      value: _bloc,
      child: BlocBuilder<ShareBloc, ShareState>(
        builder: (context, state) {
          final isLoading = state is ShareLoading || state is ShareInitial;
          final errorMessage =
              state is ShareError ? state.message : null;
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
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(28)),
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
                        padding: const EdgeInsets.all(14),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(22),
                            child: isLoading
                                ? const Center(
                                    child: CircularProgressIndicator(),
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
                                    fit: BoxFit.cover,
                                    filterQuality: FilterQuality.high,
                                  ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: theme.colorScheme.primary,
                            backgroundImage: widget.avatarUrl == null ||
                                    widget.avatarUrl!.isEmpty
                                ? null
                                : NetworkImage(widget.avatarUrl!),
                            child: widget.avatarUrl == null
                                ? Text(
                                    _initials(widget.userName),
                                    style: theme.textTheme.labelLarge?.copyWith(
                                      color: theme.colorScheme.onPrimary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.userName,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  widget.userHandle,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Flexible(
                            child: Wrap(
                              alignment: WrapAlignment.end,
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                _StatPill(
                                  label: 'Livros',
                                  value: widget.booksRead.toString(),
                                ),
                                _StatPill(
                                  label: 'Paginas',
                                  value: widget.pagesRead.toString(),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Compartilhar em',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: destinations.length,
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 0.95,
                        ),
                        itemBuilder: (context, index) {
                          final destination = destinations[index];
                          return _ShareDestinationTile(
                            destination: destination,
                            onTap: () {
                              if (bytes == null) return;
                              _shareCapsule(context, bytes, destination.label);
                            },
                            enabled: !isLoading && errorMessage == null,
                            loading: _sharing,
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: (isLoading ||
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

  String _initials(String value) {
    final parts = value.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
    }
    if (value.isEmpty) return '?';
    return value.substring(0, value.length.clamp(0, 2)).toUpperCase();
  }
}

class _ShareDestination {
  final String label;
  final IconData icon;

  const _ShareDestination({required this.label, required this.icon});
}

class _ShareDestinationTile extends StatelessWidget {
  final _ShareDestination destination;
  final VoidCallback onTap;
  final bool enabled;
  final bool loading;

  const _ShareDestinationTile({
    required this.destination,
    required this.onTap,
    required this.enabled,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return IgnorePointer(
      ignoring: !enabled || loading,
      child: Opacity(
        opacity: enabled ? 1 : 0.45,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: theme.colorScheme.outlineVariant),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    destination.icon,
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  destination.label,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;

  const _StatPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
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
