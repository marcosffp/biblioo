import 'dart:io';

import 'package:biblioo/features/community/domain/community_message.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'community_detail_shared.dart';

class CommunityChatTab extends StatelessWidget {
  final bool loading;
  final String? error;
  final List<CommunityMessage> messages;
  final bool chatSocketConnecting;
  final bool chatSocketConnected;
  final String? chatSocketError;
  final int? currentUserId;
  final String currentUserInitials;

  final TextEditingController composerController;
  final bool composerBusy;
  final bool uploadingMedia;
  final CommunityMessage? replyingTo;
  final CommunityMessage? editingMessage;
  final bool hasSpoilerComposer;
  final List<XFile> pendingImages;

  final Future<void> Function() onSendMessage;
  final Future<void> Function() onRetry;
  final Future<void> Function() onPickImages;
  final void Function(int index) onRemovePendingImage;
  final ValueChanged<bool> onSpoilerChanged;
  final VoidCallback onCancelReplying;
  final VoidCallback onCancelEditing;

  final Future<void> Function(CommunityMessage message) onReplyMessage;
  final Future<void> Function(CommunityMessage message) onEditMessage;
  final Future<void> Function(CommunityMessage message) onDeleteMessage;
  final Future<void> Function(CommunityMessage message) onToggleHeart;
  final CommunityMessage? Function(int messageId) findMessageById;

  const CommunityChatTab({
    super.key,
    required this.loading,
    required this.error,
    required this.messages,
    required this.chatSocketConnecting,
    required this.chatSocketConnected,
    required this.chatSocketError,
    required this.currentUserId,
    required this.currentUserInitials,
    required this.composerController,
    required this.composerBusy,
    required this.uploadingMedia,
    required this.replyingTo,
    required this.editingMessage,
    required this.hasSpoilerComposer,
    required this.pendingImages,
    required this.onSendMessage,
    required this.onRetry,
    required this.onPickImages,
    required this.onRemovePendingImage,
    required this.onSpoilerChanged,
    required this.onCancelReplying,
    required this.onCancelEditing,
    required this.onReplyMessage,
    required this.onEditMessage,
    required this.onDeleteMessage,
    required this.onToggleHeart,
    required this.findMessageById,
  });

  bool _shouldGroup(CommunityMessage a, CommunityMessage b) {
    if (a.authorId != b.authorId) return false;
    final diff = a.createdAt.difference(b.createdAt).inMinutes.abs();
    return diff <= 5;
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return CommunityDetailErrorState(message: error!, onRetry: onRetry);
    }

    final theme = Theme.of(context);

    return SizedBox.expand(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: _StatusCard(
              connected: chatSocketConnected,
              connecting: chatSocketConnecting,
              error: chatSocketError,
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: messages.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(12, 24, 12, 12),
                    children: [
                      CommunityDetailEmptyState(
                        icon: Icons.chat_bubble_outline_rounded,
                        title: 'Chat ainda vazio',
                        subtitle:
                            'Quando houver mensagens, elas vão aparecer aqui.',
                        color: theme.colorScheme.secondary,
                      ),
                    ],
                  )
                : ListView.separated(
                    reverse: true,
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                    itemCount: messages.length,
                    separatorBuilder: (_, index) {
                      final current = messages[index];
                      final next = messages[index + 1];
                      final grouped = _shouldGroup(current, next);
                      return SizedBox(height: grouped ? 3 : 10);
                    },
                    itemBuilder: (context, index) {
                      final message = messages[index];
                      final isMine =
                          currentUserId != null &&
                          message.authorId == currentUserId;
                      final isGroupedWithNewer =
                          index > 0 &&
                          _shouldGroup(message, messages[index - 1]);
                      final isGroupedWithOlder =
                          index < messages.length - 1 &&
                          _shouldGroup(message, messages[index + 1]);

                      return _ChatBubble(
                        message: message,
                        isMine: isMine,
                        isGroupedWithNewer: isGroupedWithNewer,
                        isGroupedWithOlder: isGroupedWithOlder,
                        currentUserInitials: currentUserInitials,
                        parentMessage: message.parentMessageId == null
                            ? null
                            : findMessageById(message.parentMessageId!),
                        onReplyMessage: onReplyMessage,
                        onEditMessage: onEditMessage,
                        onDeleteMessage: onDeleteMessage,
                        onToggleHeart: onToggleHeart,
                      );
                    },
                  ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: _ComposerCard(
                controller: composerController,
                busy: composerBusy,
                uploadingMedia: uploadingMedia,
                onSendMessage: onSendMessage,
                currentUserInitials: currentUserInitials,
                pendingImages: pendingImages,
                onPickImages: onPickImages,
                onRemovePendingImage: onRemovePendingImage,
                hasSpoilerComposer: hasSpoilerComposer,
                onSpoilerChanged: onSpoilerChanged,
                replyingTo: replyingTo,
                editingMessage: editingMessage,
                onCancelReplying: onCancelReplying,
                onCancelEditing: onCancelEditing,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final bool connected;
  final bool connecting;
  final String? error;

  const _StatusCard({
    required this.connected,
    required this.connecting,
    required this.error,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Color color;
    final String title;

    if (connected) {
      color = theme.colorScheme.primary;
      title = 'Conectado';
    } else if (connecting) {
      color = theme.colorScheme.tertiary;
      title = 'Conectando...';
    } else {
      color = theme.colorScheme.onSurfaceVariant;
      title = 'Reconectando...';
    }

    return Card(
      elevation: 1,
      child: ListTile(
        leading: Icon(Icons.wifi_tethering_rounded, color: color),
        title: Text(title),
        subtitle: error != null ? Text(error!) : null,
      ),
    );
  }
}

class _ComposerCard extends StatelessWidget {
  final TextEditingController controller;
  final bool busy;
  final bool uploadingMedia;
  final Future<void> Function() onSendMessage;
  final String currentUserInitials;
  final List<XFile> pendingImages;
  final Future<void> Function() onPickImages;
  final void Function(int index) onRemovePendingImage;
  final bool hasSpoilerComposer;
  final ValueChanged<bool> onSpoilerChanged;
  final CommunityMessage? replyingTo;
  final CommunityMessage? editingMessage;
  final VoidCallback onCancelReplying;
  final VoidCallback onCancelEditing;

  const _ComposerCard({
    required this.controller,
    required this.busy,
    required this.uploadingMedia,
    required this.onSendMessage,
    required this.currentUserInitials,
    required this.pendingImages,
    required this.onPickImages,
    required this.onRemovePendingImage,
    required this.hasSpoilerComposer,
    required this.onSpoilerChanged,
    required this.replyingTo,
    required this.editingMessage,
    required this.onCancelReplying,
    required this.onCancelEditing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (editingMessage != null)
              _ContextBar(
                icon: Icons.edit_rounded,
                title: 'Editando mensagem',
                subtitle: editingMessage!.content,
                onClose: onCancelEditing,
              )
            else if (replyingTo != null)
              _ContextBar(
                icon: Icons.reply_rounded,
                title: 'Respondendo mensagem',
                subtitle: replyingTo!.deleted
                    ? '(mensagem removida)'
                    : replyingTo!.content,
                onClose: onCancelReplying,
              ),
            if (pendingImages.isNotEmpty) ...[
              SizedBox(
                height: 84,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: pendingImages.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final image = pendingImages[index];
                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(image.path),
                            width: 84,
                            height: 84,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: InkWell(
                            onTap: () => onRemovePendingImage(index),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.55),
                                shape: BoxShape.circle,
                              ),
                              padding: const EdgeInsets.all(3),
                              child: const Icon(
                                Icons.close,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                CircleAvatar(radius: 16, child: Text(currentUserInitials)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: controller,
                    maxLines: 4,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: editingMessage != null
                          ? 'Atualize sua mensagem...'
                          : 'Escreva uma mensagem...',
                      border: InputBorder.none,
                      isDense: true,
                      hintStyle: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
                IconButton(
                  onPressed: busy ? null : onPickImages,
                  icon: const Icon(Icons.image_outlined),
                  tooltip: 'Adicionar imagens',
                ),
                IconButton(
                  onPressed: busy
                      ? null
                      : () => onSpoilerChanged(!hasSpoilerComposer),
                  icon: Icon(
                    hasSpoilerComposer
                        ? Icons.visibility_off_rounded
                        : Icons.visibility_rounded,
                  ),
                  tooltip: hasSpoilerComposer
                      ? 'Spoiler ativado'
                      : 'Marcar como spoiler',
                ),
                const SizedBox(width: 4),
                SizedBox(
                  width: 48,
                  height: 48,
                  child: busy || uploadingMedia
                      ? const Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : IconButton.filled(
                          onPressed: onSendMessage,
                          icon: Icon(
                            editingMessage != null
                                ? Icons.check_rounded
                                : Icons.send_rounded,
                          ),
                        ),
                ),
              ],
            ),
            if (hasSpoilerComposer)
              Padding(
                padding: const EdgeInsets.only(top: 6, left: 42),
                child: Text(
                  'Spoiler ativado para esta mensagem',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ContextBar extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onClose;

  const _ContextBar({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(10, 8, 8, 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onClose,
            icon: const Icon(Icons.close_rounded),
            visualDensity: VisualDensity.compact,
            tooltip: 'Cancelar',
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatefulWidget {
  final CommunityMessage message;
  final CommunityMessage? parentMessage;
  final bool isMine;
  final bool isGroupedWithNewer;
  final bool isGroupedWithOlder;
  final String currentUserInitials;
  final Future<void> Function(CommunityMessage message) onReplyMessage;
  final Future<void> Function(CommunityMessage message) onEditMessage;
  final Future<void> Function(CommunityMessage message) onDeleteMessage;
  final Future<void> Function(CommunityMessage message) onToggleHeart;

  const _ChatBubble({
    required this.message,
    required this.parentMessage,
    required this.isMine,
    required this.isGroupedWithNewer,
    required this.isGroupedWithOlder,
    required this.currentUserInitials,
    required this.onReplyMessage,
    required this.onEditMessage,
    required this.onDeleteMessage,
    required this.onToggleHeart,
  });

  @override
  State<_ChatBubble> createState() => _ChatBubbleState();
}

class _ChatBubbleState extends State<_ChatBubble> {
  bool _spoilerRevealed = false;
  double _dragDx = 0;

  static const double _maxSwipeDistance = 96;
  static const double _replyTriggerDistance = 56;

  double get _swipeProgress =>
      (_dragDx.abs() / _maxSwipeDistance).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bubbleColor = widget.isMine
        ? theme.colorScheme.primary
        : theme.colorScheme.surface;
    final textColor = widget.isMine
        ? Colors.black.withValues(alpha: 0.9)
        : theme.colorScheme.onSurface.withValues(alpha: 0.9);

    final bubbleRadius = BorderRadius.only(
      topLeft: Radius.circular(
        widget.isMine ? 18 : (widget.isGroupedWithOlder ? 8 : 18),
      ),
      topRight: Radius.circular(
        widget.isMine ? (widget.isGroupedWithOlder ? 8 : 18) : 18,
      ),
      bottomLeft: Radius.circular(
        widget.isMine ? 18 : (widget.isGroupedWithNewer ? 12 : 4),
      ),
      bottomRight: Radius.circular(
        widget.isMine ? (widget.isGroupedWithNewer ? 12 : 4) : 18,
      ),
    );

    final showAvatar = !widget.isGroupedWithNewer;
    final showMeta = !widget.isGroupedWithNewer;
    final showSpoilerMask = widget.message.hasSpoiler && !_spoilerRevealed;

    return GestureDetector(
      onLongPress: () => _showMessageActions(context),
      onHorizontalDragUpdate: (details) {
        if (widget.message.deleted) return;

        setState(() {
          final next = _dragDx + details.delta.dx;
          if (widget.isMine) {
            _dragDx = next.clamp(-_maxSwipeDistance, 0).toDouble();
          } else {
            _dragDx = next.clamp(0, _maxSwipeDistance).toDouble();
          }
        });
      },
      onHorizontalDragEnd: (_) async {
        final shouldReply = _dragDx.abs() >= _replyTriggerDistance;
        setState(() => _dragDx = 0);
        if (shouldReply && !widget.message.deleted) {
          await widget.onReplyMessage(widget.message);
        }
      },
      onHorizontalDragCancel: () {
        if (_dragDx == 0) return;
        setState(() => _dragDx = 0);
      },
      child: Stack(
        children: [
          Positioned.fill(
            child: Align(
              alignment: widget.isMine
                  ? Alignment.centerRight
                  : Alignment.centerLeft,
              child: Opacity(
                opacity: _swipeProgress,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Icon(
                    Icons.reply_rounded,
                    size: 20,
                    color: theme.colorScheme.primary.withValues(
                      alpha: 0.6 + (_swipeProgress * 0.4),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Transform.translate(
            offset: Offset(_dragDx, 0),
            child: Row(
              mainAxisAlignment: widget.isMine
                  ? MainAxisAlignment.end
                  : MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (!widget.isMine && showAvatar) ...[
                  CircleAvatar(
                    radius: 14,
                    child: Text(
                      communityInitials('U${widget.message.authorId}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                ] else if (!widget.isMine) ...[
                  const SizedBox(width: 36),
                ],
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.72,
                  ),
                  child: Column(
                    crossAxisAlignment: widget.isMine
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: bubbleColor,
                          borderRadius: bubbleRadius,
                          border: widget.isMine
                              ? null
                              : Border.all(
                                  color: theme.colorScheme.outlineVariant,
                                ),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 12,
                        ),
                        child: Column(
                          crossAxisAlignment: widget.isMine
                              ? CrossAxisAlignment.end
                              : CrossAxisAlignment.start,
                          children: [
                            if (widget.parentMessage != null)
                              _ReplyPreview(
                                isMine: widget.isMine,
                                textColor: textColor,
                                parentMessage: widget.parentMessage!,
                              ),
                            if (widget.parentMessage != null)
                              const SizedBox(height: 8),
                            if (widget.message.deleted)
                              Text(
                                '(mensagem removida)',
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  color: textColor.withValues(alpha: 0.8),
                                  fontStyle: FontStyle.italic,
                                  fontWeight: FontWeight.w400,
                                  height: 1.4,
                                ),
                              )
                            else ...[
                              if (showSpoilerMask)
                                InkWell(
                                  onTap: () =>
                                      setState(() => _spoilerRevealed = true),
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(
                                        alpha: 0.22,
                                      ),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.visibility_off_rounded,
                                          size: 16,
                                          color: textColor,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Spoiler - toque para revelar',
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(color: textColor),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              else
                                Text(
                                  widget.message.content.isEmpty
                                      ? '(sem texto)'
                                      : widget.message.content,
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: textColor,
                                    fontWeight: FontWeight.w400,
                                    height: 1.4,
                                  ),
                                ),
                              if (widget.message.images.isNotEmpty) ...[
                                const SizedBox(height: 10),
                                _MessageImageGrid(
                                  imageUrls: widget.message.images,
                                  bubbleTextColor: textColor,
                                ),
                              ],
                              if (widget.message.tags.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: widget.message.tags
                                      .map(
                                        (tag) => Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 3,
                                          ),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(
                                              999,
                                            ),
                                            color: Colors.black.withValues(
                                              alpha: 0.15,
                                            ),
                                          ),
                                          child: Text(
                                            '#$tag',
                                            style: theme.textTheme.bodySmall
                                                ?.copyWith(color: textColor),
                                          ),
                                        ),
                                      )
                                      .toList(),
                                ),
                              ],
                            ],
                          ],
                        ),
                      ),
                      if (showMeta) ...[
                        const SizedBox(height: 6),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              communityRelativeTimeLabel(
                                widget.message.createdAt,
                              ),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            if (widget.message.editedAt != null) ...[
                              const SizedBox(width: 6),
                              Text(
                                'editada',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                            const SizedBox(width: 6),
                            InkWell(
                              onTap: widget.message.deleted
                                  ? null
                                  : () => widget.onToggleHeart(widget.message),
                              borderRadius: BorderRadius.circular(999),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 2,
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      widget.message.heartCount > 0
                                          ? Icons.favorite_rounded
                                          : Icons.favorite_border_rounded,
                                      size: 14,
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                    const SizedBox(width: 3),
                                    Text(
                                      '${widget.message.heartCount}',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: theme
                                                .colorScheme
                                                .onSurfaceVariant,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                if (widget.isMine && showAvatar) ...[
                  const SizedBox(width: 8),
                  CircleAvatar(
                    radius: 14,
                    child: Text(widget.currentUserInitials),
                  ),
                ] else if (widget.isMine) ...[
                  const SizedBox(width: 36),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showMessageActions(BuildContext context) async {
    if (widget.message.deleted) return;

    await showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.reply_rounded),
                title: const Text('Responder'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  widget.onReplyMessage(widget.message);
                },
              ),
              ListTile(
                leading: const Icon(Icons.favorite_border_rounded),
                title: const Text('Curtir'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  widget.onToggleHeart(widget.message);
                },
              ),
              if (widget.isMine)
                ListTile(
                  leading: const Icon(Icons.edit_rounded),
                  title: const Text('Editar'),
                  onTap: () {
                    Navigator.of(sheetContext).pop();
                    widget.onEditMessage(widget.message);
                  },
                ),
              if (widget.isMine)
                ListTile(
                  leading: const Icon(Icons.delete_outline_rounded),
                  title: const Text('Excluir'),
                  onTap: () {
                    Navigator.of(sheetContext).pop();
                    widget.onDeleteMessage(widget.message);
                  },
                ),
            ],
          ),
        );
      },
    );
  }
}

class _ReplyPreview extends StatelessWidget {
  final bool isMine;
  final Color textColor;
  final CommunityMessage parentMessage;

  const _ReplyPreview({
    required this.isMine,
    required this.textColor,
    required this.parentMessage,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: isMine ? 0.18 : 0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        parentMessage.deleted
            ? '(mensagem removida)'
            : (parentMessage.content.isEmpty
                  ? '(sem texto)'
                  : parentMessage.content),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: theme.textTheme.bodySmall?.copyWith(color: textColor),
      ),
    );
  }
}

class _MessageImageGrid extends StatelessWidget {
  final List<String> imageUrls;
  final Color bubbleTextColor;

  const _MessageImageGrid({
    required this.imageUrls,
    required this.bubbleTextColor,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrls.length == 1) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Image.network(
          imageUrls.first,
          width: double.infinity,
          height: 190,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _ImageFallback(color: bubbleTextColor),
        ),
      );
    }

    final limited = imageUrls.take(4).toList();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: limited.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 6,
        crossAxisSpacing: 6,
        childAspectRatio: 1,
      ),
      itemBuilder: (context, index) {
        final url = limited[index];
        return ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    _ImageFallback(color: bubbleTextColor),
              ),
              if (index == 3 && imageUrls.length > 4)
                Container(
                  color: Colors.black.withValues(alpha: 0.42),
                  alignment: Alignment.center,
                  child: Text(
                    '+${imageUrls.length - 4}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _ImageFallback extends StatelessWidget {
  final Color color;

  const _ImageFallback({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      height: 140,
      alignment: Alignment.center,
      color: Colors.black.withValues(alpha: 0.15),
      child: Icon(Icons.broken_image_rounded, color: color),
    );
  }
}
