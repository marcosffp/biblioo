import 'dart:io';

import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _bioController = TextEditingController();
  final _picker = ImagePicker();

  User? _originalUser;
  String? _avatarFilePath;
  String? _bannerFilePath;
  bool _isPrivate = false;
  bool _initialized = false;
  bool _saving = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  void _init(User user) {
    if (_initialized) return;
    _originalUser = user;
    _usernameController.text = user.username;
    _emailController.text = user.email ?? '';
    _bioController.text = user.bio ?? '';
    _isPrivate = user.isPrivate;
    _initialized = true;
  }

  String _formatDateTimePtBr(String value) {
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;

    String two(int n) => n.toString().padLeft(2, '0');
    final day = two(parsed.day);
    final month = two(parsed.month);
    final year = parsed.year;
    final hour = two(parsed.hour);
    final minute = two(parsed.minute);

    return '$day/$month/$year $hour:$minute';
  }

  Future<void> _pickAvatar() async {
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
    if (image == null) return;
    setState(() => _avatarFilePath = image.path);
  }

  Future<void> _pickBanner() async {
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
    if (image == null) return;
    setState(() => _bannerFilePath = image.path);
  }

  ImageProvider<Object>? _bannerImageProvider(User user) {
    if (_bannerFilePath != null) return FileImage(File(_bannerFilePath!));
    if (user.bannerUrl != null && user.bannerUrl!.isNotEmpty) {
      return NetworkImage(user.bannerUrl!);
    }
    return null;
  }

  ImageProvider<Object>? _avatarImageProvider(User user) {
    if (_avatarFilePath != null) return FileImage(File(_avatarFilePath!));
    if (user.avatarUrl != null && user.avatarUrl!.isNotEmpty) {
      return NetworkImage(user.avatarUrl!);
    }
    return null;
  }

  void _onSave() {
    if (_saving) return;
    final bloc = context.read<UserBloc>();

    final username = _usernameController.text.trim();
    final bio = _bioController.text.trim();

    if (username.isEmpty || username.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe um username válido.')),
      );
      return;
    }

    setState(() => _saving = true);
    bloc.add(
      UpdateProfile(
        username: username,
        bio: bio,
        avatarFilePath: _avatarFilePath,
        bannerFilePath: _bannerFilePath,
        isPrivate: _isPrivate,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<UserBloc, UserState>(
      listener: (context, state) {
        if (state is UserLoaded && _saving) {
          setState(() {
            _saving = false;
            _originalUser = state.user;
          });
          context.pop();
        }
        if (state is UserError && _saving) {
          setState(() => _saving = false);
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        if (state is UserLoaded) _init(state.user);
        final user = state is UserLoaded ? state.user : _originalUser;
        if (user == null) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final isLoading = state is UserLoading || _saving;
        final theme = Theme.of(context);
        final avatarProvider = _avatarImageProvider(user);
        final bannerProvider = _bannerImageProvider(user);
        final previewUsername = _usernameController.text.trim().isNotEmpty
            ? _usernameController.text.trim()
            : user.username;

        return Scaffold(
          appBar: AppBar(
            leading: BackButton(onPressed: () => context.pop()),
            title: const Text('Editar Perfil'),
            actions: [
              TextButton(
                onPressed: isLoading ? null : _onSave,
                child: isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Salvar'),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              Text(
                'Preview do perfil',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),
              Card(
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 128,
                      width: double.infinity,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          image: bannerProvider != null
                              ? DecorationImage(
                                  image: bannerProvider,
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Transform.translate(
                            offset: const Offset(0, -24),
                            child: CircleAvatar(
                              radius: 34,
                              backgroundColor: theme.colorScheme.primary,
                              backgroundImage: avatarProvider,
                              child: avatarProvider == null
                                  ? Text(
                                      user.username
                                          .substring(
                                            0,
                                            user.username.length
                                                .clamp(0, 2)
                                                .toInt(),
                                          )
                                          .toUpperCase(),
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            color: theme.colorScheme.onPrimary,
                                          ),
                                    )
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    previewUsername,
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(fontWeight: FontWeight.w600),
                                  ),
                                  if (user.email != null &&
                                      user.email!.isNotEmpty)
                                    Text(
                                      user.email!,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: theme
                                                .colorScheme
                                                .onSurfaceVariant,
                                          ),
                                    ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _isPrivate
                                        ? 'Perfil privado'
                                        : 'Perfil publico',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_bioController.text.trim().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(_bioController.text.trim()),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: isLoading ? null : _pickAvatar,
                      icon: const Icon(Icons.account_circle_outlined),
                      label: Text(
                        _avatarFilePath == null
                            ? 'Trocar avatar'
                            : 'Avatar selecionado',
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: isLoading ? null : _pickBanner,
                      icon: const Icon(Icons.image_outlined),
                      label: Text(
                        _bannerFilePath == null
                            ? 'Trocar banner'
                            : 'Banner selecionado',
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _usernameController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  labelText: 'Nome de usuario',
                  prefixIcon: Icon(Icons.alternate_email),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'E-mail',
                  prefixIcon: Icon(Icons.mail_outline),
                  helperText: 'Nao editavel nesta versao do app.',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _bioController,
                enabled: !isLoading,
                maxLines: 3,
                maxLength: 500,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  labelText: 'Bio',
                  prefixIcon: Icon(Icons.info_outline),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                title: const Text('Perfil privado'),
                subtitle: const Text(
                  'Apenas seguidores aprovados veem seu perfil',
                ),
                value: _isPrivate,
                onChanged: isLoading
                    ? null
                    : (v) => setState(() => _isPrivate = v),
                contentPadding: EdgeInsets.zero,
              ),
              if (_originalUser?.createdAt != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Criado em: ${_formatDateTimePtBr(_originalUser!.createdAt!)}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
