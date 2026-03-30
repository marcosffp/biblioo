import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _bioController = TextEditingController();
  bool _isPrivate = false;
  bool _initialized = false;

  @override
  void dispose() {
    _bioController.dispose();
    super.dispose();
  }

  void _init(User user) {
    if (_initialized) return;
    _bioController.text = user.bio ?? '';
    _isPrivate = user.isPrivate;
    _initialized = true;
  }

  void _onSave() {
    context.read<UserBloc>().add(
      UpdateProfile(bio: _bioController.text.trim()),
    );
    if (_isPrivate != (context.read<UserBloc>().state is UserLoaded
        ? (context.read<UserBloc>().state as UserLoaded).user.isPrivate
        : false)) {
      context.read<UserBloc>().add(UpdateVisibility(_isPrivate));
    }
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoaded) _init(state.user);

        final isLoading = state is UserLoading;

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
              TextField(
                controller: _bioController,
                enabled: !isLoading,
                maxLines: 3,
                maxLength: 500,
                decoration: const InputDecoration(
                  labelText: 'Bio',
                  prefixIcon: Icon(Icons.info_outline),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                title: const Text('Perfil privado'),
                subtitle: const Text('Apenas seguidores aprovados veem seu perfil'),
                value: _isPrivate,
                onChanged: isLoading
                    ? null
                    : (v) => setState(() => _isPrivate = v),
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
        );
      },
    );
  }
}