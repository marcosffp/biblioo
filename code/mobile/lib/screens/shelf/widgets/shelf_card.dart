import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:flutter/material.dart';

/// Card de estante na listagem — exibe nome, contagem e preview de capas.
/// Segue wireframe: card com covers empilhados + nome + seta.
class ShelfCard extends StatelessWidget {
  final Shelf shelf;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const ShelfCard({
    super.key,
    required this.shelf,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // ── Cover preview ou ícone de placeholder ──
              _buildCoverPreview(theme),
              const SizedBox(width: 16),

              // ── Texto ──
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shelf.name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${shelf.itemCount} ${shelf.itemCount == 1 ? 'livro' : 'livros'}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),

              // ── Ações ──
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'edit') onEdit();
                  if (value == 'delete') onDelete();
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined, size: 18),
                        SizedBox(width: 8),
                        Text('Editar'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline, size: 18),
                        SizedBox(width: 8),
                        Text('Excluir'),
                      ],
                    ),
                  ),
                ],
              ),

              Icon(
                Icons.chevron_right,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoverPreview(ThemeData theme) {
    if (shelf.coverPreview.isEmpty) {
      return Container(
        width: 48,
        height: 64,
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          Icons.menu_book_outlined,
          color: theme.colorScheme.primary,
          size: 24,
        ),
      );
    }

    return SizedBox(
      width: 56,
      height: 64,
      child: Stack(
        children: [
          for (int i = 0; i < shelf.coverPreview.length && i < 3; i++)
            Positioned(
              left: i * 10.0,
              child: Container(
                width: 40,
                height: 60,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.shadow,
                      blurRadius: 2,
                      offset: const Offset(1, 1),
                    ),
                  ],
                  image: DecorationImage(
                    image: NetworkImage(shelf.coverPreview[i]),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
