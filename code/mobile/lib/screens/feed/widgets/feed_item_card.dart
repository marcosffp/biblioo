import 'package:biblioo/features/feed/bloc/feed_bloc.dart';
import 'package:biblioo/features/feed/bloc/feed_event.dart';
import 'package:biblioo/features/feed/domain/feed_item.dart';
import 'package:biblioo/screens/feed/widgets/feed_comments_sheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class FeedItemCard extends StatelessWidget {
  final FeedItem item;
  final int currentUserId;

  const FeedItemCard({
    super.key,
    required this.item,
    required this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    if (item.isReview) {
      return _ReviewPostCard(item: item, currentUserId: currentUserId);
    }
    return _TextPostCard(item: item, currentUserId: currentUserId);
  }
}

class _ReviewPostCard extends StatelessWidget {
  final FeedItem item;
  final int currentUserId;

  const _ReviewPostCard({required this.item, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = item.content;
    final author = item.authorUsername ?? 'Leitor';
    final isOwn = content.userId == currentUserId;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AuthorRow(
              author: author,
              avatarUrl: item.authorAvatarUrl,
              createdAt: content.createdAt ?? item.createdAt,
              trailing: isOwn
                  ? _FeedItemMenu(
                      deleteLabel: 'Excluir avaliacao',
                      onDelete: () => _confirmDelete(
                        context: context,
                        title: 'Excluir avaliacao?',
                        message:
                            'Esta avaliacao sera removida do feed e do livro.',
                        onConfirm: () => context.read<FeedBloc>().add(
                          FeedReviewDeleteRequested(reviewId: content.id),
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(height: 12),
            if (content.bookId != null)
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => context.push('/book/${content.bookId}'),
                child: _BookReviewSummary(content: content),
              ),
            if (content.text.trim().isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(content.text, style: theme.textTheme.bodyMedium),
            ],
            if (content.images.isNotEmpty) ...[
              const SizedBox(height: 12),
              _ImageStrip(urls: content.images),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _ActionButton(
                  icon: content.likedByCurrentUser
                      ? Icons.favorite
                      : Icons.favorite_border,
                  label: '${content.likeCount}',
                  color: content.likedByCurrentUser ? Colors.red : null,
                  onTap: content.userId == currentUserId
                      ? null
                      : () => context.read<FeedBloc>().add(
                          FeedReviewLikeToggled(reviewId: content.id),
                        ),
                ),
                const SizedBox(width: 16),
                _ActionButton(
                  icon: Icons.chat_bubble_outline,
                  label: '${content.commentCount}',
                  onTap: () => _openComments(
                    context,
                    contentId: content.id,
                    contentType: 'REVIEW',
                    currentUserId: currentUserId,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TextPostCard extends StatefulWidget {
  final FeedItem item;
  final int currentUserId;

  const _TextPostCard({required this.item, required this.currentUserId});

  @override
  State<_TextPostCard> createState() => _TextPostCardState();
}

class _TextPostCardState extends State<_TextPostCard> {
  bool _spoilerRevealed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = widget.item.content;
    final hiddenBySpoiler = content.hasSpoiler && !_spoilerRevealed;
    final isOwn = content.userId == widget.currentUserId;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AuthorRow(
              author: widget.item.authorUsername ?? 'Leitor',
              avatarUrl: widget.item.authorAvatarUrl,
              createdAt: content.createdAt ?? widget.item.createdAt,
              trailing: isOwn
                  ? _FeedItemMenu(
                      deleteLabel: 'Excluir post',
                      onDelete: () => _confirmDelete(
                        context: context,
                        title: 'Excluir post?',
                        message:
                            'O post sera removido do feed. Comentarios vinculados tambem serao removidos.',
                        onConfirm: () => context.read<FeedBloc>().add(
                          FeedPostDeleteRequested(postId: content.id),
                        ),
                      ),
                    )
                  : null,
            ),
            if (hiddenBySpoiler) ...[
              const SizedBox(height: 10),
              _SpoilerBanner(
                onReveal: () => setState(() => _spoilerRevealed = true),
              ),
            ] else ...[
              if (content.bookId != null) ...[
                const SizedBox(height: 10),
                InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () => context.push('/book/${content.bookId}'),
                  child: _BookReviewSummary(content: content),
                ),
              ],
              if (content.text.trim().isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(content.text, style: theme.textTheme.bodyMedium),
              ],
              if (content.images.isNotEmpty) ...[
                const SizedBox(height: 12),
                _ImageStrip(urls: content.images),
              ],
              if (content.gifUrl != null) ...[
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    content.gifUrl!,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ],
              if (content.tags.isNotEmpty) ...[
                const SizedBox(height: 8),
                _TagRow(tags: content.tags),
              ],
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _ActionButton(
                  icon: content.likedByCurrentUser
                      ? Icons.favorite
                      : Icons.favorite_border,
                  label: '${content.likeCount}',
                  color: content.likedByCurrentUser ? Colors.red : null,
                  onTap: content.userId == widget.currentUserId
                      ? null
                      : () => context.read<FeedBloc>().add(
                          FeedPostLikeToggled(postId: content.id),
                        ),
                ),
                const SizedBox(width: 16),
                _ActionButton(
                  icon: Icons.chat_bubble_outline,
                  label: '${content.commentCount}',
                  onTap: () => _openComments(
                    context,
                    contentId: content.id,
                    contentType: 'POST',
                    currentUserId: widget.currentUserId,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SpoilerBanner extends StatelessWidget {
  final VoidCallback onReveal;

  const _SpoilerBanner({required this.onReveal});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onReveal,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: theme.colorScheme.errorContainer.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              Icons.warning_amber_outlined,
              size: 16,
              color: theme.colorScheme.error,
            ),
            const SizedBox(width: 8),
            Text(
              'Contem spoiler — toque para revelar',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TagRow extends StatelessWidget {
  final List<String> tags;

  const _TagRow({required this.tags});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: tags
          .map(
            (tag) => Text(
              '#$tag',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          )
          .toList(),
    );
  }
}

class _AuthorRow extends StatelessWidget {
  final String author;
  final String? avatarUrl;
  final DateTime? createdAt;
  final Widget? trailing;

  const _AuthorRow({
    required this.author,
    this.avatarUrl,
    this.createdAt,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        GestureDetector(
          onTap: () => context.push('/user/$author'),
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: theme.colorScheme.primaryContainer,
                backgroundImage: avatarUrl != null && avatarUrl!.isNotEmpty
                    ? NetworkImage(avatarUrl!)
                    : null,
                child: avatarUrl == null || avatarUrl!.isEmpty
                    ? Text(
                        _initials(author),
                        style: TextStyle(
                          color: theme.colorScheme.primary,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
            ],
          ),
        ),
        Expanded(
          child: GestureDetector(
            onTap: () => context.push('/user/$author'),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(author, style: theme.textTheme.labelLarge),
                Text(
                  _relativeTime(createdAt),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    if (words.isEmpty || words.first.isEmpty) return 'L';
    if (words.length == 1) return words.first.substring(0, 1).toUpperCase();
    return '${words.first[0]}${words.last[0]}'.toUpperCase();
  }
}

class _BookReviewSummary extends StatelessWidget {
  final FeedContent content;

  const _BookReviewSummary({required this.content});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          _BookCover(url: content.bookCoverUrl),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  content.bookTitle ?? 'Livro',
                  style: theme.textTheme.labelLarge,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (content.bookAuthors.isNotEmpty)
                  Text(
                    content.bookAuthors.join(', '),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                if (content.rating != null) ...[
                  const SizedBox(height: 4),
                  _RatingStars(rating: content.rating!),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FeedItemMenu extends StatelessWidget {
  final String deleteLabel;
  final VoidCallback onDelete;

  const _FeedItemMenu({required this.deleteLabel, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'Mais opcoes',
      onSelected: (value) {
        if (value == 'delete') onDelete();
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              Icon(
                Icons.delete_outline,
                size: 18,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(width: 8),
              Text(deleteLabel),
            ],
          ),
        ),
      ],
    );
  }
}

class _BookCover extends StatelessWidget {
  final String? url;

  const _BookCover({this.url});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (url != null && url!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.network(
          url!,
          width: 42,
          height: 60,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _placeholder(theme),
        ),
      );
    }
    return _placeholder(theme);
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      width: 42,
      height: 60,
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Icon(Icons.menu_book, color: theme.colorScheme.primary, size: 20),
    );
  }
}

class _RatingStars extends StatelessWidget {
  final int rating;

  const _RatingStars({required this.rating});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: List.generate(5, (index) {
        final filled = index < rating;
        return Icon(
          filled ? Icons.star : Icons.star_border,
          size: 14,
          color: filled ? theme.colorScheme.primary : theme.colorScheme.outline,
        );
      }),
    );
  }
}

class _ImageStrip extends StatelessWidget {
  final List<String> urls;

  const _ImageStrip({required this.urls});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 88,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: urls.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              urls[index],
              width: 88,
              height: 88,
              fit: BoxFit.cover,
            ),
          );
        },
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Color? color;

  const _ActionButton({
    required this.icon,
    required this.label,
    this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolvedColor = color ?? theme.colorScheme.onSurfaceVariant;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 18, color: resolvedColor),
            const SizedBox(width: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(color: resolvedColor),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> _openComments(
  BuildContext context, {
  required int contentId,
  required String contentType,
  required int currentUserId,
}) {
  return showFeedCommentsSheet(
    context: context,
    contentId: contentId,
    contentType: contentType,
    currentUserId: currentUserId,
    onCommentCountDelta: (delta) => context.read<FeedBloc>().add(
      FeedCommentCountChanged(
        contentId: contentId,
        contentType: contentType,
        delta: delta,
      ),
    ),
  );
}

Future<void> _confirmDelete({
  required BuildContext context,
  required String title,
  required String message,
  required VoidCallback onConfirm,
}) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(dialogContext).pop(true),
          child: const Text('Excluir'),
        ),
      ],
    ),
  );

  if (confirmed == true && context.mounted) {
    onConfirm();
  }
}

String _relativeTime(DateTime? date) {
  if (date == null) return '';
  final diff = DateTime.now().difference(date);
  if (diff.inMinutes < 1) return 'agora';
  if (diff.inMinutes < 60) return '${diff.inMinutes}min';
  if (diff.inHours < 24) return '${diff.inHours}h';
  if (diff.inDays < 7) return '${diff.inDays}d';
  return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}
