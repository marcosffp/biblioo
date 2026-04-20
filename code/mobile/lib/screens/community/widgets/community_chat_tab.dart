import 'package:biblioo/features/community/domain/community_message.dart';
import 'package:flutter/material.dart';

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
  final Future<void> Function() onSendMessage;
  final Future<void> Function() onRetry;

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
    required this.onSendMessage,
    required this.onRetry,
  });

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
                    separatorBuilder: (_, _) => const SizedBox(height: 10), // ← corrigido
                    itemBuilder: (context, index) {
                      final message = messages[index];
                      final isMine =
                          currentUserId != null &&
                          message.authorId == currentUserId;
                      return _ChatBubble(
                        message: message,
                        isMine: isMine,
                        currentUserInitials: currentUserInitials,
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
                onSendMessage: onSendMessage,
                currentUserInitials: currentUserInitials,
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
      title = 'Desconectado';
    }

    return Card(
      elevation: 0,
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
  final Future<void> Function() onSendMessage;
  final String currentUserInitials;

  const _ComposerCard({
    required this.controller,
    required this.busy,
    required this.onSendMessage,
    required this.currentUserInitials,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            CircleAvatar(radius: 16, child: Text(currentUserInitials)),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 3,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: 'Escreva uma mensagem...',
                  border: InputBorder.none,
                  isDense: true,
                  hintStyle: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 48,
              height: 48,
              child: busy
                  ? const Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : IconButton.filled(
                      onPressed: onSendMessage,
                      icon: const Icon(Icons.send_rounded),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final CommunityMessage message;
  final bool isMine;
  final String currentUserInitials;

  const _ChatBubble({
    required this.message,
    required this.isMine,
    required this.currentUserInitials,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bubbleColor = isMine
        ? theme.colorScheme.primary
        : theme.colorScheme.surface;
    final textColor = isMine
        ? theme.colorScheme.onPrimary
        : theme.colorScheme.onSurface;
    final bubbleRadius = BorderRadius.only(
      topLeft: const Radius.circular(18),
      topRight: const Radius.circular(18),
      bottomLeft: Radius.circular(isMine ? 18 : 4),
      bottomRight: Radius.circular(isMine ? 4 : 18),
    );

    return Row(
      mainAxisAlignment:
          isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        if (!isMine) ...[
          CircleAvatar(
            radius: 14,
            child: Text(communityInitials('U${message.authorId}')),
          ),
          const SizedBox(width: 8),
        ],
        Flexible(
          child: Container(
            decoration: BoxDecoration(
              color: bubbleColor,
              borderRadius: bubbleRadius,
              border: isMine
                  ? null
                  : Border.all(color: theme.colorScheme.outlineVariant),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              crossAxisAlignment: isMine
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                Text(
                  message.deleted
                      ? '(mensagem removida)'
                      : (message.content.isEmpty
                          ? '(sem texto)'
                          : message.content),
                  style:
                      theme.textTheme.bodyMedium?.copyWith(color: textColor),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      communityRelativeTimeLabel(message.createdAt),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isMine
                            ? theme.colorScheme.onPrimary
                                .withValues(alpha: 0.8)
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      message.deleted
                          ? Icons.delete_outline_rounded
                          : Icons.favorite_border_rounded,
                      size: 14,
                      color: isMine
                          ? theme.colorScheme.onPrimary
                              .withValues(alpha: 0.75)
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${message.images.length}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isMine
                            ? theme.colorScheme.onPrimary
                                .withValues(alpha: 0.8)
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        if (isMine) ...[
          const SizedBox(width: 8),
          CircleAvatar(radius: 14, child: Text(currentUserInitials)),
        ],
      ],
    );
  }
}