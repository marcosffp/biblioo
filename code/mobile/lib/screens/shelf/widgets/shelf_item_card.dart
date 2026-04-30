import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

/// Card de item na estante — exibe capa, título, status e barra de progresso.
/// Segue wireframe: ícone de placeholdercapa + título + autor + barra de progresso %.
class ShelfItemCard extends StatelessWidget {
  final ShelfItem item;
  final int shelfId;

  const ShelfItemCard({
    super.key,
    required this.item,
    required this.shelfId,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/book/${item.bookId}'),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            // ── Capa do livro ──
            _buildCover(theme),
            const SizedBox(width: 12),

            // ── Informações ──
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.bookTitle,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // ── Status chip ──
                  _buildStatusChip(theme),
                  const SizedBox(height: 8),

                  // ── Barra de progresso (se ativo) ──
                  if (item.isActiveReading) ...[
                    _buildProgressBar(theme),
                    const SizedBox(height: 4),
                  ],
                ],
              ),
            ),

            // ── Menu de ações ──
            PopupMenuButton<String>(
              onSelected: (value) => _handleAction(context, value),
              icon: Icon(
                Icons.more_vert,
                size: 20,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              itemBuilder: (context) => [
                if (item.isActiveReading)
                  const PopupMenuItem(
                    value: 'progress',
                    child: Row(
                      children: [
                        Icon(Icons.auto_stories_outlined, size: 18),
                        SizedBox(width: 8),
                        Text('Atualizar progresso'),
                      ],
                    ),
                  ),
                const PopupMenuItem(
                  value: 'status',
                  child: Row(
                    children: [
                      Icon(Icons.swap_horiz, size: 18),
                      SizedBox(width: 8),
                      Text('Mudar status'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'remove',
                  child: Row(
                    children: [
                      Icon(Icons.delete_outline, size: 18),
                      SizedBox(width: 8),
                      Text('Remover'),
                    ],
                  ),
                ),
              ],
            ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCover(ThemeData theme) {
    if (item.bookCoverUrl != null && item.bookCoverUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Image.network(
          item.bookCoverUrl!,
          width: 48,
          height: 68,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) =>
              _buildCoverPlaceholder(theme),
        ),
      );
    }
    return _buildCoverPlaceholder(theme);
  }

  Widget _buildCoverPlaceholder(ThemeData theme) {
    return Container(
      width: 48,
      height: 68,
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(
        Icons.menu_book,
        color: theme.colorScheme.primary,
        size: 22,
      ),
    );
  }

  Widget _buildStatusChip(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: _statusColor(theme).withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        item.status.label,
        style: theme.textTheme.labelSmall?.copyWith(
          color: _statusColor(theme),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildProgressBar(ThemeData theme) {
    final percent = (item.progressPercent ?? 0) / 100.0;

    return Row(
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percent.clamp(0.0, 1.0),
              minHeight: 6,
              backgroundColor:
                  theme.colorScheme.primaryContainer.withValues(alpha: 0.4),
              valueColor:
                  AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '${item.progressPercent ?? 0}%',
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Color _statusColor(ThemeData theme) {
    switch (item.status) {
      case ReadingStatus.reading:
      case ReadingStatus.rereading:
        return theme.colorScheme.primary;
      case ReadingStatus.completed:
        return const Color(0xFF2E7D32);
      case ReadingStatus.abandoned:
        return theme.colorScheme.error;
      case ReadingStatus.wantToRead:
        return theme.colorScheme.tertiary;
    }
  }

  void _handleAction(BuildContext context, String action) {
    switch (action) {
      case 'progress':
        _showProgressDialog(context);
      case 'status':
        _showStatusPicker(context);
      case 'remove':
        _confirmRemove(context);
    }
  }

  void _showProgressDialog(BuildContext context) {
    final controller = TextEditingController(
      text: item.currentPage?.toString() ?? '',
    );

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Atualizar progresso'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Página atual${item.totalPages != null ? ' (de ${item.totalPages})' : ''}:',
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Ex.: 42',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              final page = int.tryParse(controller.text.trim());
              if (page != null && page >= 0) {
                Navigator.pop(dialogCtx);
                context.read<ShelfBloc>().add(ShelfItemProgressUpdated(
                      shelfId: shelfId,
                      itemId: item.id,
                      currentPage: page,
                    ));
              }
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
  }

  void _showStatusPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetCtx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context)
                    .colorScheme
                    .onSurfaceVariant
                    .withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Mudar status',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            ...ReadingStatus.values.map((status) => ListTile(
                  leading: Icon(
                    status == item.status
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  title: Text(status.label),
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    if (status != item.status) {
                      context.read<ShelfBloc>().add(ShelfItemStatusChanged(
                            shelfId: shelfId,
                            itemId: item.id,
                            newStatus: status,
                          ));
                    }
                  },
                )),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _confirmRemove(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Remover livro?'),
        content: Text(
          '"${item.bookTitle}" será removido desta estante.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<ShelfBloc>().add(ShelfItemRemoveRequested(
                    shelfId: shelfId,
                    itemId: item.id,
                  ));
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
  }
}
