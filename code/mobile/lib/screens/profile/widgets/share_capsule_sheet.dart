import 'dart:io';
import 'dart:typed_data';

import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/share/bloc/share_capsule_cubit.dart';
import 'package:biblioo/features/share/bloc/share_capsule_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> showShareCapsuleSheet({
  required BuildContext context,
  required String userHandle,
  required int booksRead,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) => BlocProvider(
      create: (_) => ShareCapsuleCubit(Injector.instance.shareRepo)..load(),
      child: _ShareCapsuleSheet(userHandle: userHandle, booksRead: booksRead),
    ),
  );
}

class _ShareCapsuleSheet extends StatefulWidget {
  final String userHandle;
  final int booksRead;

  const _ShareCapsuleSheet({required this.userHandle, required this.booksRead});

  @override
  State<_ShareCapsuleSheet> createState() => _ShareCapsuleSheetState();
}

class _ShareCapsuleSheetState extends State<_ShareCapsuleSheet> {
  bool _sharing = false;

  Future<void> _share(Uint8List bytes) async {
    if (_sharing) return;
    setState(() => _sharing = true);
    try {
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/biblioo-capsula-literaria.png');
      await file.writeAsBytes(bytes);

      final text =
          'Minha Cápsula Literária no Biblioo 📚 — ${widget.booksRead} livros lidos ${widget.userHandle}';
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'image/png')],
        text: text,
        subject: 'Cápsula Literária – Biblioo',
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível compartilhar.')),
      );
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.outlineVariant,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(height: 16),
          // Limita a largura da cápsula para não ocupar a tela inteira em
          // celulares (replica o comportamento do max-w-md do front).
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 320),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: ColoredBox(
                  color: const Color(0xFF121212),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: BlocBuilder<ShareCapsuleCubit, ShareCapsuleState>(
                      builder: (context, state) {
                        if (state is ShareCapsuleLoaded) {
                          return Image.memory(state.bytes, fit: BoxFit.contain);
                        }
                        if (state is ShareCapsuleError) {
                          return _CapsuleErrorMessage(
                            onRetry: () => context
                                .read<ShareCapsuleCubit>()
                                .load(forceRefresh: true),
                          );
                        }
                        return const _CapsuleLoadingMessage();
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          BlocBuilder<ShareCapsuleCubit, ShareCapsuleState>(
            builder: (context, state) {
              final bytes = state is ShareCapsuleLoaded ? state.bytes : null;
              return Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: bytes == null || _sharing
                          ? null
                          : () => _share(bytes),
                      icon: _sharing
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.share_outlined, size: 18),
                      label: const Text('Compartilhar'),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(0, 48),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(48, 48),
                    ),
                    child: const Icon(Icons.close),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _CapsuleLoadingMessage extends StatelessWidget {
  const _CapsuleLoadingMessage();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Gerando sua cápsula literária…',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _CapsuleErrorMessage extends StatelessWidget {
  final VoidCallback onRetry;

  const _CapsuleErrorMessage({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.white70, size: 32),
            const SizedBox(height: 12),
            const Text(
              'Não foi possível gerar a imagem.\nVerifique sua conexão ou tente novamente.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 16),
            FilledButton.tonalIcon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
