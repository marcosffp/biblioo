import 'dart:async';
import 'dart:math' as math;

import 'package:biblioo/features/assistant/bloc/assistant_bloc.dart';
import 'package:biblioo/features/assistant/bloc/assistant_event.dart';
import 'package:biblioo/features/assistant/bloc/assistant_state.dart';
import 'package:biblioo/features/assistant/domain/chat_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

const _suggestions = [
  'Me recomende um livro',
  'Resumo do que estou lendo',
  'Criar uma nova coleção',
  'Sortear meu próximo livro',
];

const _typewriterCharsPerTick = 6;
const _typewriterIntervalMs = 16;

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen>
    with SingleTickerProviderStateMixin {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isAtBottom = true;

  // Typewriter state
  String? _typewritingId;
  final ValueNotifier<int> _typewritingChars = ValueNotifier<int>(0);
  int _typewritingTotal = 0;
  Timer? _typewriterTimer;

  // Dots animation
  late final AnimationController _dotsController;

  @override
  void initState() {
    super.initState();
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _scrollController.addListener(_onScroll);
    context.read<AssistantBloc>().add(AssistantInitialized());
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _typewriterTimer?.cancel();
    _typewritingChars.dispose();
    _dotsController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final pos = _scrollController.position;
    final distFromBottom = pos.maxScrollExtent - pos.pixels;
    final next = distFromBottom < 80;
    if (next != _isAtBottom) {
      setState(() => _isAtBottom = next);
    }
  }

  void _scrollToBottom({bool instant = false}) {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: instant
          ? Duration.zero
          : const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  void _startTypewriter(String id, int totalLength) {
    _typewriterTimer?.cancel();
    _typewritingTotal = totalLength;
    _typewritingChars.value = 0;
    // setState only for _typewritingId (read at build time by the bubble).
    setState(() => _typewritingId = id);

    _typewriterTimer = Timer.periodic(
      const Duration(milliseconds: _typewriterIntervalMs),
      (_) {
        if (!mounted) return;
        if (_typewritingChars.value >= _typewritingTotal) {
          _typewriterTimer?.cancel();
          _typewritingChars.value = 0;
          setState(() => _typewritingId = null);
          return;
        }
        // No setState — only the ValueListenableBuilder wrapped around the
        // animating bubble's content reacts to this change.
        _typewritingChars.value = math.min(
          _typewritingChars.value + _typewriterCharsPerTick,
          _typewritingTotal,
        );
        if (_isAtBottom) _scrollToBottom();
      },
    );
  }

  void _sendMessage(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    _controller.clear();
    context.read<AssistantBloc>().add(AssistantMessageSent(trimmed));
    setState(() => _isAtBottom = true);
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  void _showClearDialog() {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Limpar conversa'),
        content: const Text(
          'Isso apagará todo o histórico com o Bibo. Deseja continuar?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              context
                  .read<AssistantBloc>()
                  .add(AssistantHistoryCleared());
            },
            style: FilledButton.styleFrom(
              minimumSize: Size.zero,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: const Text('Limpar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AssistantBloc, AssistantState>(
      listenWhen: (prev, curr) =>
          curr.messages.length > prev.messages.length ||
          curr.error != prev.error ||
          curr.isLoading != prev.isLoading,
      listener: (context, state) {
        // Toggle dots animation to match isLoading — keeps the controller
        // idle (zero rebuilds) when no typing indicator is shown.
        if (state.isLoading && !_dotsController.isAnimating) {
          _dotsController.repeat();
        } else if (!state.isLoading && _dotsController.isAnimating) {
          _dotsController.stop();
        }

        if (state.error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error!),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
          return;
        }

        // New assistant message arrived → start typewriter (skip welcome)
        if (state.messages.isNotEmpty) {
          final last = state.messages.last;
          if (!last.isUser && !state.isLoading && last.id != 'welcome') {
            _startTypewriter(last.id, last.content.length);
          }
        }

        WidgetsBinding.instance
            .addPostFrameCallback((_) => _scrollToBottom());
      },
      builder: (context, state) {
        return Scaffold(
          appBar: _buildAppBar(context, state),
          body: Column(
            children: [
              Expanded(child: _buildMessageList(context, state)),
              _buildInput(context, state),
            ],
          ),
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(
      BuildContext context, AssistantState state) {
    final cs = Theme.of(context).colorScheme;
    return AppBar(
      backgroundColor: cs.primary,
      foregroundColor: cs.onPrimary,
      titleSpacing: 0,
      title: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: cs.onPrimary.withValues(alpha: 0.2),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Image.asset(
                'assets/images/biblioo-carinha-branca-logo.png',
                width: 22,
                height: 22,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Bibo',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              Text(
                state.isLoading ? 'digitando...' : 'Seu assistente literário',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.delete_outline),
          tooltip: 'Limpar conversa',
          onPressed: _showClearDialog,
        ),
      ],
    );
  }

  Widget _buildMessageList(BuildContext context, AssistantState state) {
    final hasOnlyWelcome = state.messages.length <= 1;
    final items = _buildItems(state.messages);

    return Stack(
      children: [
        ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          itemCount: items.length +
              (state.isLoading ? 1 : 0) +
              (hasOnlyWelcome ? 1 : 0),
          itemBuilder: (context, index) {
            // Suggestions block (after messages, before typing)
            if (hasOnlyWelcome && index == items.length) {
              return _buildSuggestions(context, state);
            }

            // Typing indicator
            final typingIndex =
                items.length + (hasOnlyWelcome ? 1 : 0);
            if (state.isLoading && index == typingIndex) {
              return _buildTypingIndicator(context);
            }

            final item = items[index];
            if (item is _DateDivider) {
              return _buildDateDivider(context, item.label);
            }
            return _buildBubble(context, item as ChatMessage, state);
          },
        ),

        // Scroll-to-bottom button
        if (!_isAtBottom)
          Positioned(
            bottom: 8,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () {
                  setState(() => _isAtBottom = true);
                  _scrollToBottom();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.keyboard_arrow_down,
                          size: 18,
                          color: Theme.of(context).colorScheme.onPrimary),
                      const SizedBox(width: 4),
                      Text(
                        'Ir para o final',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.onPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  List<Object> _buildItems(List<ChatMessage> messages) {
    final result = <Object>[];
    String? lastLabel;

    for (final msg in messages) {
      final label = _dateLabel(msg.timestamp);
      if (label != lastLabel) {
        result.add(_DateDivider(label));
        lastLabel = label;
      }
      result.add(msg);
    }
    return result;
  }

  String _dateLabel(DateTime dt) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final msgDay = DateTime(dt.year, dt.month, dt.day);
    final diff = today.difference(msgDay).inDays;

    if (dt.millisecondsSinceEpoch == 0) return 'Início';
    if (diff == 0) return 'Hoje';
    if (diff == 1) return 'Ontem';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  Widget _buildDateDivider(BuildContext context, String label) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(child: Divider(color: cs.outline, height: 1)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: cs.onSurfaceVariant,
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(child: Divider(color: cs.outline, height: 1)),
        ],
      ),
    );
  }

  Widget _buildBubble(
      BuildContext context, ChatMessage msg, AssistantState state) {
    final cs = Theme.of(context).colorScheme;
    final isUser = msg.isUser;
    final isAnimating = _typewritingId == msg.id;

    final Widget content = isAnimating
        ? ValueListenableBuilder<int>(
            valueListenable: _typewritingChars,
            builder: (_, chars, _) {
              final clamped = math.min(chars, msg.content.length);
              return _MessageContent(
                content: msg.content.substring(0, clamped),
                isUser: isUser,
                isAnimating: true,
              );
            },
          )
        : _MessageContent(
            content: msg.content,
            isUser: isUser,
            isAnimating: false,
          );

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: cs.primary,
              child: Padding(
                padding: const EdgeInsets.all(3),
                child: Image.asset(
                  'assets/images/biblioo-carinha-branca-logo.png',
                  width: 16,
                  height: 16,
                ),
              ),
            ),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.78,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? cs.primary : cs.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isUser ? 18 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 18),
                ),
                border: isUser
                    ? null
                    : Border.all(color: cs.outline.withValues(alpha: 0.5)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: content,
            ),
          ),
          if (isUser) const SizedBox(width: 6),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: cs.primary,
            child: Padding(
              padding: const EdgeInsets.all(3),
              child: Image.asset(
                'assets/images/biblioo-carinha-branca-logo.png',
                width: 16,
                height: 16,
              ),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
              border: Border.all(color: cs.outline.withValues(alpha: 0.5)),
            ),
            child: AnimatedBuilder(
              animation: _dotsController,
              builder: (_, _) => Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(3, (i) {
                  final phase = ((_dotsController.value + i / 3) % 1.0);
                  final scale = 0.6 + 0.4 * math.sin(phase * math.pi);
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Transform.scale(
                      scale: scale,
                      child: CircleAvatar(
                        radius: 4,
                        backgroundColor:
                            cs.onSurfaceVariant.withValues(alpha: 0.6),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestions(BuildContext context, AssistantState state) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Sugestões',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: cs.onSurfaceVariant,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _suggestions.map((s) {
              return ActionChip(
                label: Text(s, style: const TextStyle(fontSize: 13)),
                onPressed: state.isLoading
                    ? null
                    : () => _sendMessage(s),
                side: BorderSide(color: cs.outline),
                backgroundColor: cs.surface,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildInput(BuildContext context, AssistantState state) {
    final cs = Theme.of(context).colorScheme;
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: BoxDecoration(
          color: cs.surface,
          border: Border(top: BorderSide(color: cs.outline.withValues(alpha: 0.4))),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                enabled: !state.isLoading,
                textInputAction: TextInputAction.send,
                maxLines: 4,
                minLines: 1,
                onSubmitted: state.isLoading ? null : _sendMessage,
                decoration: InputDecoration(
                  hintText: 'Pergunte algo ao Bibo...',
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide:
                        BorderSide(color: cs.outline.withValues(alpha: 0.6)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(color: cs.primary, width: 1.5),
                  ),
                  filled: true,
                  fillColor: cs.surfaceContainerHighest,
                ),
              ),
            ),
            const SizedBox(width: 8),
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: _controller,
              builder: (_, value, _) {
                final canSend =
                    value.text.trim().isNotEmpty && !state.isLoading;
                return IconButton.filled(
                  onPressed: canSend
                      ? () => _sendMessage(_controller.text)
                      : null,
                  icon: const Icon(Icons.send_rounded),
                  style: IconButton.styleFrom(
                    backgroundColor: canSend ? cs.primary : cs.outline,
                    foregroundColor: cs.onPrimary,
                    minimumSize: const Size(44, 44),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── Message content renderer (bold + lists) ────────────────────────────────

class _MessageContent extends StatelessWidget {
  final String content;
  final bool isUser;
  final bool isAnimating;

  const _MessageContent({
    required this.content,
    required this.isUser,
    required this.isAnimating,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final textColor = isUser ? cs.onPrimary : cs.onSurface;

    final blocks = _parseBlocks(content);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 0; i < blocks.length; i++) ...[
          if (i > 0) const SizedBox(height: 6),
          _renderBlock(blocks[i], textColor, isAnimating && i == blocks.length - 1),
        ],
      ],
    );
  }

  Widget _renderBlock(
      _Block block, Color textColor, bool showCursor) {
    if (block is _ParagraphBlock) {
      return RichText(
        text: TextSpan(
          children: [
            ..._inlineSpans(block.text, textColor),
            if (showCursor)
              WidgetSpan(
                child: Container(
                  width: 2,
                  height: 14,
                  margin: const EdgeInsets.only(left: 1),
                  color: textColor,
                ),
              ),
          ],
        ),
      );
    }

    if (block is _ListBlock) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < block.items.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    block.ordered ? '${i + 1}. ' : '• ',
                    style: TextStyle(color: textColor, fontSize: 14),
                  ),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        children: [
                          ..._inlineSpans(block.items[i], textColor),
                          if (showCursor && i == block.items.length - 1)
                            WidgetSpan(
                              child: Container(
                                width: 2,
                                height: 14,
                                margin: const EdgeInsets.only(left: 1),
                                color: textColor,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      );
    }

    return const SizedBox.shrink();
  }

  List<InlineSpan> _inlineSpans(String text, Color textColor) {
    final spans = <InlineSpan>[];
    final parts = text.split(RegExp(r'(\*\*[^*]+\*\*)'));
    for (final part in parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        spans.add(TextSpan(
          text: part.substring(2, part.length - 2),
          style: TextStyle(
            color: textColor,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ));
      } else {
        spans.add(TextSpan(
          text: part,
          style: TextStyle(color: textColor, fontSize: 14),
        ));
      }
    }
    return spans;
  }

  List<_Block> _parseBlocks(String content) {
    final blocks = <_Block>[];
    _ListBlock? currentList;

    void flushList() {
      if (currentList != null) {
        blocks.add(currentList!);
        currentList = null;
      }
    }

    for (final rawLine in content.split(RegExp(r'\r?\n'))) {
      final line = rawLine.trim();
      if (line.isEmpty) {
        flushList();
        continue;
      }

      final ordered = RegExp(r'^\d+\.\s+(.+)').firstMatch(line);
      if (ordered != null) {
        if (currentList == null || !currentList!.ordered) {
          flushList();
          currentList = _ListBlock(ordered: true);
        }
        currentList!.items.add(ordered.group(1)!);
        continue;
      }

      final unordered = RegExp(r'^[-*]\s+(.+)').firstMatch(line);
      if (unordered != null) {
        if (currentList == null || currentList!.ordered) {
          flushList();
          currentList = _ListBlock(ordered: false);
        }
        currentList!.items.add(unordered.group(1)!);
        continue;
      }

      flushList();
      blocks.add(_ParagraphBlock(line));
    }

    flushList();
    return blocks;
  }
}

abstract class _Block {}

class _ParagraphBlock extends _Block {
  final String text;
  _ParagraphBlock(this.text);
}

class _ListBlock extends _Block {
  final bool ordered;
  final List<String> items = [];
  _ListBlock({required this.ordered});
}

class _DateDivider {
  final String label;
  _DateDivider(this.label);
}
