import 'dart:typed_data';

import 'package:biblioo/features/feed/bloc/post_bloc.dart';
import 'package:biblioo/features/feed/bloc/post_event.dart';
import 'package:biblioo/features/feed/bloc/post_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _textController = TextEditingController();
  final _tagController = TextEditingController();
  final _imagePicker = ImagePicker();

  final List<_PickedImage> _images = [];
  _PickedImage? _gif;
  final List<String> _tags = [];
  bool _hasSpoiler = false;

  static const int _maxImages = 5;
  static const int _maxChars = 2000;
  static const int _maxImageBytes = 5 * 1024 * 1024;
  static const int _maxGifBytes = 10 * 1024 * 1024;

  @override
  void dispose() {
    _textController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    if (_images.length >= _maxImages) return;
    final remaining = _maxImages - _images.length;
    final files = await _imagePicker.pickMultiImage(limit: remaining);
    var skipped = 0;
    for (final file in files) {
      final bytes = await file.readAsBytes();
      if (bytes.length > _maxImageBytes) {
        skipped++;
        continue;
      }
      if (mounted) {
        setState(() => _images.add(_PickedImage(bytes: bytes, name: file.name)));
      }
    }
    if (mounted && skipped > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Imagem excede o limite de 5 MB.')),
      );
    }
  }

  Future<void> _pickGif() async {
    final file = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (file == null) return;
    final mime = file.mimeType ?? '';
    if (!file.name.toLowerCase().endsWith('.gif') && !mime.contains('gif')) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Selecione um arquivo GIF.')),
        );
      }
      return;
    }
    final bytes = await file.readAsBytes();
    if (bytes.length > _maxGifBytes) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('GIF excede o limite de 10 MB.')),
        );
      }
      return;
    }
    if (mounted) {
      setState(() => _gif = _PickedImage(bytes: bytes, name: file.name));
    }
  }

  void _removeImage(int index) => setState(() => _images.removeAt(index));

  void _removeGif() => setState(() => _gif = null);

  void _addTag(String value) {
    final tag = value.trim().replaceAll('#', '');
    if (tag.isEmpty || _tags.contains(tag)) return;
    setState(() => _tags.add(tag));
    _tagController.clear();
  }

  void _removeTag(String tag) => setState(() => _tags.remove(tag));

  bool get _canSubmit =>
      _textController.text.trim().isNotEmpty &&
      _textController.text.length <= _maxChars;

  void _submit() {
    if (!_canSubmit) return;
    context.read<PostBloc>().add(
      PostCreateRequested(
        text: _textController.text.trim(),
        tags: List.unmodifiable(_tags),
        hasSpoiler: _hasSpoiler,
        images: _images.map((i) => i.bytes).toList(),
        imageNames: _images.map((i) => i.name).toList(),
        gif: _gif?.bytes,
        gifName: _gif?.name,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PostBloc, PostState>(
      listener: (context, state) {
        if (state is PostCreateSuccess) {
          Navigator.of(context).pop(true);
        } else if (state is PostCreateError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Criar post')),
        bottomNavigationBar: BlocBuilder<PostBloc, PostState>(
          builder: (context, state) {
            final loading = state is PostCreating;
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: FilledButton(
                  onPressed: (!_canSubmit || loading) ? null : _submit,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    textStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  child: loading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Publicar'),
                ),
              ),
            );
          },
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _TextField(
                controller: _textController,
                maxChars: _maxChars,
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),
              _MediaRow(
                imageCount: _images.length,
                maxImages: _maxImages,
                hasGif: _gif != null,
                onPickImages: _pickImages,
                onPickGif: _pickGif,
                hasSpoiler: _hasSpoiler,
                onToggleSpoiler: () =>
                    setState(() => _hasSpoiler = !_hasSpoiler),
              ),
              if (_images.isNotEmpty) ...[
                const SizedBox(height: 12),
                _ImagePreviewRow(
                  images: _images,
                  onRemove: _removeImage,
                ),
              ],
              if (_gif != null) ...[
                const SizedBox(height: 12),
                _GifPreviewRow(gif: _gif!, onRemove: _removeGif),
              ],
              const SizedBox(height: 16),
              _TagInput(
                controller: _tagController,
                tags: _tags,
                onAdd: _addTag,
                onRemove: _removeTag,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TextField extends StatelessWidget {
  final TextEditingController controller;
  final int maxChars;
  final ValueChanged<String> onChanged;

  const _TextField({
    required this.controller,
    required this.maxChars,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final length = controller.text.length;
    final overLimit = length > maxChars;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        TextField(
          controller: controller,
          onChanged: onChanged,
          maxLines: null,
          minLines: 5,
          decoration: const InputDecoration(
            hintText: 'O que você está pensando?',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '$length / $maxChars',
          style: theme.textTheme.bodySmall?.copyWith(
            color: overLimit ? theme.colorScheme.error : theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _MediaRow extends StatelessWidget {
  final int imageCount;
  final int maxImages;
  final bool hasGif;
  final VoidCallback onPickImages;
  final VoidCallback onPickGif;
  final bool hasSpoiler;
  final VoidCallback onToggleSpoiler;

  const _MediaRow({
    required this.imageCount,
    required this.maxImages,
    required this.hasGif,
    required this.onPickImages,
    required this.onPickGif,
    required this.hasSpoiler,
    required this.onToggleSpoiler,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        _MediaButton(
          icon: Icons.image_outlined,
          label: 'Foto ($imageCount/$maxImages)',
          enabled: imageCount < maxImages && !hasGif,
          onTap: onPickImages,
        ),
        const SizedBox(width: 8),
        _MediaButton(
          icon: Icons.gif_box_outlined,
          label: 'GIF',
          enabled: !hasGif && imageCount == 0,
          onTap: onPickGif,
        ),
        const Spacer(),
        GestureDetector(
          onTap: onToggleSpoiler,
          child: Row(
            children: [
              Icon(
                Icons.warning_amber_outlined,
                size: 18,
                color: hasSpoiler
                    ? theme.colorScheme.error
                    : theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Spoiler',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: hasSpoiler
                      ? theme.colorScheme.error
                      : theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MediaButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool enabled;
  final VoidCallback onTap;

  const _MediaButton({
    required this.icon,
    required this.label,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = enabled
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4);
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImagePreviewRow extends StatelessWidget {
  final List<_PickedImage> images;
  final ValueChanged<int> onRemove;

  const _ImagePreviewRow({required this.images, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 88,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.memory(
                  images[index].bytes,
                  width: 88,
                  height: 88,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                top: 2,
                right: 2,
                child: GestureDetector(
                  onTap: () => onRemove(index),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    padding: const EdgeInsets.all(2),
                    child: const Icon(Icons.close, size: 14, color: Colors.white),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _GifPreviewRow extends StatelessWidget {
  final _PickedImage gif;
  final VoidCallback onRemove;

  const _GifPreviewRow({required this.gif, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.memory(
            gif.bytes,
            height: 160,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(999),
              ),
              padding: const EdgeInsets.all(4),
              child: const Icon(Icons.close, size: 16, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}

class _TagInput extends StatelessWidget {
  final TextEditingController controller;
  final List<String> tags;
  final ValueChanged<String> onAdd;
  final ValueChanged<String> onRemove;

  const _TagInput({
    required this.controller,
    required this.tags,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tags',
          style: theme.textTheme.labelMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 8),
        if (tags.isNotEmpty) ...[
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: tags
                .map(
                  (tag) => Chip(
                    label: Text('#$tag'),
                    labelStyle: theme.textTheme.bodySmall,
                    deleteIcon: const Icon(Icons.close, size: 14),
                    onDeleted: () => onRemove(tag),
                    visualDensity: VisualDensity.compact,
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 8),
        ],
        TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Adicionar tag (pressione Enter)',
            prefixText: '#',
            border: OutlineInputBorder(),
            isDense: true,
          ),
          onSubmitted: onAdd,
          textInputAction: TextInputAction.done,
        ),
      ],
    );
  }
}

class _PickedImage {
  final Uint8List bytes;
  final String name;

  const _PickedImage({required this.bytes, required this.name});
}
