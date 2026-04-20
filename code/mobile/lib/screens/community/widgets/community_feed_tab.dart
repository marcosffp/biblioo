import 'dart:io';

import 'package:biblioo/features/community/domain/community_post.dart';
import 'package:biblioo/features/community/domain/community_post_draft.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'community_detail_shared.dart';

class CommunityFeedTab extends StatefulWidget {
  final bool loading;
  final String? error;
  final List<CommunityPost> posts;
  final Future<void> Function(CommunityPostDraft draft) onCreatePost;
  final Future<void> Function() onRetry;

  const CommunityFeedTab({
    super.key,
    required this.loading,
    required this.error,
    required this.posts,
    required this.onCreatePost,
    required this.onRetry,
  });

  @override
  State<CommunityFeedTab> createState() => _CommunityFeedTabState();
}

class _CommunityFeedTabState extends State<CommunityFeedTab> {
  final _textController = TextEditingController();
  final _tagsController = TextEditingController();
  final _pageRefController = TextEditingController();
  final _picker = ImagePicker();

  final List<XFile> _pickedImages = [];
  bool _hasSpoiler = false;
  bool _posting = false;

  @override
  void dispose() {
    _textController.dispose();
    _tagsController.dispose();
    _pageRefController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final images = await _picker.pickMultiImage(imageQuality: 85);
    if (images.isEmpty) return;
    setState(() {
      _pickedImages.addAll(images);
    });
  }

  void _removeImage(int index) {
    setState(() => _pickedImages.removeAt(index));
  }

  Future<void> _submit() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _posting) return;

    final tags = _tagsController.text
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList();
    final pageRefText = _pageRefController.text.trim();
    final pageRef = pageRefText.isEmpty ? null : int.tryParse(pageRefText);

    setState(() => _posting = true);
    try {
      await widget.onCreatePost(
        CommunityPostDraft(
          text: text,
          imagePaths: _pickedImages.map((image) => image.path).toList(),
          gifUrl: null,
          tags: tags,
          hasSpoiler: _hasSpoiler,
          pageRef: pageRef,
        ),
      );
      _textController.clear();
      _tagsController.clear();
      _pageRefController.clear();
      setState(() {
        _pickedImages.clear();
        _hasSpoiler = false;
      });
    } finally {
      if (!mounted) return;
      setState(() => _posting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (widget.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (widget.error != null) {
      return CommunityDetailErrorState(
        message: widget.error!,
        onRetry: widget.onRetry,
      );
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 20),
      children: [
        Card(
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Escreva um post',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _pickImages,
                      icon: const Icon(Icons.photo_library_outlined),
                      tooltip: 'Adicionar imagens',
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _textController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText: 'Esse livro é, com certeza, o melhor da série...',
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilterChip(
                      label: const Text('Spoiler'),
                      selected: _hasSpoiler,
                      onSelected: (value) =>
                          setState(() => _hasSpoiler = value),
                    ),
                    SizedBox(
                      width: 128,
                      child: TextField(
                        controller: _pageRefController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Página',
                          hintText: 'Ex.: 45',
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 220,
                      child: TextField(
                        controller: _tagsController,
                        decoration: const InputDecoration(
                          labelText: 'Tags',
                          hintText: 'drama, humor, spoiler',
                        ),
                      ),
                    ),
                  ],
                ),
                if (_pickedImages.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 88,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _pickedImages.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final image = _pickedImages[index];
                        return Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Image.file(
                                File(image.path),
                                width: 88,
                                height: 88,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: InkWell(
                                onTap: () => _removeImage(index),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.6),
                                    shape: BoxShape.circle,
                                  ),
                                  padding: const EdgeInsets.all(4),
                                  child: const Icon(
                                    Icons.close_rounded,
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
                ],
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton.icon(
                    onPressed: _posting ? null : _submit,
                    icon: _posting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send_rounded),
                    label: const Text('Publicar'),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (widget.posts.isEmpty)
          CommunityDetailEmptyState(
            icon: Icons.dynamic_feed_rounded,
            title: 'Nenhum post por aqui ainda',
            subtitle: 'Quando houver atividade, o feed vai aparecer aqui.',
            color: theme.colorScheme.primary,
          )
        else
          ...widget.posts.map(
            (post) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 18,
                            child: Text('${post.userId}'),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Usuário #${post.userId}',
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  communityRelativeTimeLabel(
                                    post.updatedAt ?? post.createdAt,
                                  ),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (post.hasSpoiler)
                            const Chip(
                              label: Text('Spoiler'),
                              visualDensity: VisualDensity.compact,
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        post.text.isEmpty ? '(sem texto)' : post.text,
                        style: theme.textTheme.bodyMedium,
                      ),
                      if (post.images.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 104,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: post.images.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 8),
                            itemBuilder: (context, index) {
                              final imageUrl = post.images[index];
                              return ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: Image.network(
                                  imageUrl,
                                  width: 140,
                                  height: 104,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 140,
                                    height: 104,
                                    color: theme
                                        .colorScheme
                                        .surfaceContainerHighest,
                                    alignment: Alignment.center,
                                    child: const Icon(
                                      Icons.image_not_supported_outlined,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                      if (post.tags.isNotEmpty || post.pageRef != null) ...[
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            if (post.pageRef != null)
                              CommunityDetailMiniStat(
                                label: 'p.${post.pageRef}',
                                icon: Icons.menu_book_rounded,
                              ),
                            ...post.tags.map(
                              (tag) => Chip(
                                label: Text('#$tag'),
                                visualDensity: VisualDensity.compact,
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          CommunityDetailMiniStat(
                            label: '${post.likeCount}',
                            icon: Icons.favorite_rounded,
                          ),
                          const SizedBox(width: 8),
                          CommunityDetailMiniStat(
                            label: '${post.commentCount}',
                            icon: Icons.mode_comment_rounded,
                          ),
                        ],
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
}
