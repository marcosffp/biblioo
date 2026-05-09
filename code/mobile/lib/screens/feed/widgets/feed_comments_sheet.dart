import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/feed/bloc/feed_comments_bloc.dart';
import 'package:biblioo/features/feed/bloc/feed_comments_event.dart';
import 'package:biblioo/features/feed/bloc/feed_comments_state.dart';
import 'package:biblioo/features/feed/domain/comment.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

Future<void> showFeedCommentsSheet({
  required BuildContext context,
  required int contentId,
  required String contentType,
  required int currentUserId,
  required ValueChanged<int> onCommentCountDelta,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => BlocProvider(
      create: (_) => FeedCommentsBloc(Injector.instance.feedRepo)
        ..add(
          FeedCommentsLoadRequested(
            contentId: contentId,
            contentType: contentType,
          ),
        ),
      child: _FeedCommentsSheet(
        currentUserId: currentUserId,
        onCommentCountDelta: onCommentCountDelta,
      ),
    ),
  );
}

class _FeedCommentsSheet extends StatefulWidget {
  final int currentUserId;
  final ValueChanged<int> onCommentCountDelta;

  const _FeedCommentsSheet({
    required this.currentUserId,
    required this.onCommentCountDelta,
  });

  @override
  State<_FeedCommentsSheet> createState() => _FeedCommentsSheetState();
}

class _FeedCommentsSheetState extends State<_FeedCommentsSheet> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    context.read<FeedCommentsBloc>().add(FeedCommentCreateRequested(text));
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return BlocListener<FeedCommentsBloc, FeedCommentsState>(
      listener: (context, state) {
        if (state is FeedCommentsLoaded) {
          if (state.commentCountDelta != 0) {
            widget.onCommentCountDelta(state.commentCountDelta);
          }
          if (state.actionError != null) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(state.actionError!)));
          }
        }
      },
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.82,
          child: Column(
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
                child: Row(
                  children: [
                    Text(
                      'Comentarios',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      tooltip: 'Fechar',
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: BlocBuilder<FeedCommentsBloc, FeedCommentsState>(
                  builder: (context, state) {
                    if (state is FeedCommentsLoading ||
                        state is FeedCommentsInitial) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (state is FeedCommentsError) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            state.message,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    }
                    final loaded = state as FeedCommentsLoaded;
                    if (loaded.comments.isEmpty) {
                      return const _EmptyComments();
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                      itemCount: loaded.comments.length + (loaded.last ? 0 : 1),
                      itemBuilder: (context, index) {
                        if (index == loaded.comments.length) {
                          return Center(
                            child: TextButton(
                              onPressed: loaded.isLoadingMore
                                  ? null
                                  : () => context.read<FeedCommentsBloc>().add(
                                      FeedCommentsLoadMoreRequested(),
                                    ),
                              child: Text(
                                loaded.isLoadingMore
                                    ? 'Carregando...'
                                    : 'Ver mais comentarios',
                              ),
                            ),
                          );
                        }
                        return _CommentTile(
                          comment: loaded.comments[index],
                          currentUserId: widget.currentUserId,
                          repliesState: loaded
                              .repliesByCommentId[loaded.comments[index].id],
                        );
                      },
                    );
                  },
                ),
              ),
              SafeArea(
                top: false,
                child: _Composer(controller: _controller, onSubmit: _submit),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSubmit;

  const _Composer({required this.controller, required this.onSubmit});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          top: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.newline,
              decoration: const InputDecoration(
                hintText: 'Escreva um comentario...',
                isDense: true,
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton.filled(
            tooltip: 'Enviar',
            onPressed: onSubmit,
            icon: const Icon(Icons.send_rounded),
          ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatefulWidget {
  final FeedComment comment;
  final int currentUserId;
  final CommentRepliesState? repliesState;

  const _CommentTile({
    required this.comment,
    required this.currentUserId,
    this.repliesState,
  });

  @override
  State<_CommentTile> createState() => _CommentTileState();
}

class _CommentTileState extends State<_CommentTile> {
  final _replyController = TextEditingController();
  bool _replying = false;
  bool _repliesOpen = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _ensureRepliesLoaded());
  }

  @override
  void didUpdateWidget(covariant _CommentTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.comment.id != widget.comment.id) {
      _replying = false;
      _repliesOpen = true;
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => _ensureRepliesLoaded(),
      );
    }
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  void _toggleReplies() {
    setState(() => _repliesOpen = !_repliesOpen);
    if (_repliesOpen) {
      _ensureRepliesLoaded();
    }
  }

  void _ensureRepliesLoaded() {
    if (!mounted || widget.repliesState != null) return;
    context.read<FeedCommentsBloc>().add(
      FeedCommentRepliesLoadRequested(widget.comment.id),
    );
  }

  void _deleteComment() {
    context.read<FeedCommentsBloc>().add(
      FeedCommentDeleteRequested(widget.comment.id),
    );
  }

  void _toggleLike() {
    context.read<FeedCommentsBloc>().add(
      FeedCommentLikeToggled(widget.comment.id),
    );
  }

  void _toggleReplyComposer() {
    setState(() => _replying = !_replying);
    if (!_repliesOpen) {
      setState(() => _repliesOpen = true);
      _ensureRepliesLoaded();
    }
  }

  void _submitReply() {
    final text = _replyController.text.trim();
    if (text.isEmpty) return;
    context.read<FeedCommentsBloc>().add(
      FeedCommentReplyCreateRequested(commentId: widget.comment.id, text: text),
    );
    _replyController.clear();
    setState(() {
      _replying = false;
      _repliesOpen = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final comment = widget.comment;
    final theme = Theme.of(context);
    final isOwn = comment.userId == widget.currentUserId;

    if (comment.deleted) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: theme.colorScheme.surfaceContainerHighest,
                  child: Icon(
                    Icons.delete_outline,
                    size: 16,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Comentario excluido',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            if (_hasReplies)
              Padding(
                padding: const EdgeInsets.only(left: 42, top: 2),
                child: _InlineAction(
                  icon: Icons.forum_outlined,
                  label: _repliesOpen ? 'Ocultar respostas' : 'Ver respostas',
                  onTap: _toggleReplies,
                ),
              ),
            if (_repliesOpen)
              _RepliesBlock(
                commentId: comment.id,
                currentUserId: widget.currentUserId,
                repliesState: widget.repliesState,
                showEmpty: false,
              ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _CommentAvatar(comment: comment),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          comment.authorUsername ?? 'Leitor ${comment.userId}',
                          style: theme.textTheme.labelLarge,
                        ),
                        Text(
                          _relativeTime(comment.createdAt),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(comment.text, style: theme.textTheme.bodyMedium),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 12,
                      children: [
                        _InlineAction(
                          icon: Icons.favorite_border,
                          label: comment.likeCount > 0
                              ? 'Curtir (${comment.likeCount})'
                              : 'Curtir',
                          onTap: _toggleLike,
                        ),
                        _InlineAction(
                          icon: Icons.reply_outlined,
                          label: 'Responder',
                          onTap: _toggleReplyComposer,
                        ),
                        if (_hasReplies)
                          _InlineAction(
                            icon: Icons.forum_outlined,
                            label: _repliesOpen
                                ? 'Ocultar respostas'
                                : 'Ver respostas',
                            onTap: _toggleReplies,
                          ),
                        if (isOwn)
                          _InlineAction(
                            icon: Icons.delete_outline,
                            label: 'Excluir',
                            color: theme.colorScheme.error,
                            onTap: _deleteComment,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (_replying) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.only(left: 42),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _replyController,
                      autofocus: true,
                      decoration: const InputDecoration(
                        hintText: 'Escreva uma resposta...',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    tooltip: 'Enviar resposta',
                    onPressed: _submitReply,
                    icon: const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
          ],
          if (_repliesOpen)
            _RepliesBlock(
              commentId: comment.id,
              currentUserId: widget.currentUserId,
              repliesState: widget.repliesState,
              showEmpty: false,
            ),
        ],
      ),
    );
  }

  bool get _hasReplies {
    final state = widget.repliesState;
    return state == null || state.replies.isNotEmpty || !state.last;
  }
}

class _RepliesBlock extends StatelessWidget {
  final int commentId;
  final int currentUserId;
  final CommentRepliesState? repliesState;
  final bool showEmpty;

  const _RepliesBlock({
    required this.commentId,
    required this.currentUserId,
    this.repliesState,
    this.showEmpty = true,
  });

  @override
  Widget build(BuildContext context) {
    final state = repliesState;
    if (state == null || state.isLoading) {
      return const Padding(
        padding: EdgeInsets.fromLTRB(42, 12, 0, 0),
        child: LinearProgressIndicator(),
      );
    }

    if (state.replies.isEmpty) {
      if (!showEmpty) return const SizedBox.shrink();
      return Padding(
        padding: const EdgeInsets.fromLTRB(42, 8, 0, 0),
        child: Text(
          'Nenhuma resposta ainda.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(42, 8, 0, 0),
      child: Column(
        children: [
          ...state.replies.map(
            (reply) => _ReplyTile(reply: reply, currentUserId: currentUserId),
          ),
          if (!state.last)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: state.isLoadingMore
                    ? null
                    : () => context.read<FeedCommentsBloc>().add(
                        FeedCommentRepliesLoadMoreRequested(commentId),
                      ),
                child: Text(
                  state.isLoadingMore ? 'Carregando...' : 'Ver mais respostas',
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ReplyTile extends StatelessWidget {
  final FeedComment reply;
  final int currentUserId;

  const _ReplyTile({required this.reply, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isOwn = reply.userId == currentUserId;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CommentAvatar(comment: reply, small: true),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reply.authorUsername ?? 'Leitor ${reply.userId}',
                  style: theme.textTheme.labelMedium,
                ),
                const SizedBox(height: 2),
                Text(reply.text, style: theme.textTheme.bodySmall),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 12,
                  children: [
                    _InlineAction(
                      icon: Icons.favorite_border,
                      label: reply.likeCount > 0
                          ? 'Curtir (${reply.likeCount})'
                          : 'Curtir',
                      onTap: () => context.read<FeedCommentsBloc>().add(
                        FeedCommentLikeToggled(reply.id),
                      ),
                    ),
                    if (isOwn)
                      _InlineAction(
                        icon: Icons.delete_outline,
                        label: 'Excluir',
                        color: theme.colorScheme.error,
                        onTap: () => context.read<FeedCommentsBloc>().add(
                          FeedCommentDeleteRequested(reply.id),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentAvatar extends StatelessWidget {
  final FeedComment comment;
  final bool small;

  const _CommentAvatar({required this.comment, this.small = false});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final radius = small ? 12.0 : 16.0;
    final username = comment.authorUsername ?? 'Leitor';
    return CircleAvatar(
      radius: radius,
      backgroundColor: theme.colorScheme.primaryContainer,
      backgroundImage:
          comment.authorAvatarUrl != null && comment.authorAvatarUrl!.isNotEmpty
          ? NetworkImage(comment.authorAvatarUrl!)
          : null,
      child: comment.authorAvatarUrl == null || comment.authorAvatarUrl!.isEmpty
          ? Text(
              username.substring(0, 1).toUpperCase(),
              style: TextStyle(
                color: theme.colorScheme.primary,
                fontSize: small ? 10 : 12,
                fontWeight: FontWeight.w700,
              ),
            )
          : null,
    );
  }
}

class _InlineAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _InlineAction({
    required this.icon,
    required this.label,
    required this.onTap,
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
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: resolvedColor),
            const SizedBox(width: 3),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: resolvedColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyComments extends StatelessWidget {
  const _EmptyComments();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 44,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: 12),
            Text(
              'Nenhum comentario ainda.',
              style: theme.textTheme.titleSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              'Seja a primeira pessoa a comentar.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
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
