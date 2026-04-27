import 'package:biblioo/features/community/bloc/community_bloc.dart';
import 'package:biblioo/features/community/bloc/community_event.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InviteCodeSheet extends StatefulWidget {
  const InviteCodeSheet._();

  static Future<void> show(BuildContext context) {
    final bloc = context.read<CommunityBloc>();
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) =>
          BlocProvider.value(value: bloc, child: const InviteCodeSheet._()),
    );
  }

  @override
  State<InviteCodeSheet> createState() => _InviteCodeSheetState();
}

class _InviteCodeSheetState extends State<InviteCodeSheet> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    context.read<CommunityBloc>().add(
      CommunityJoinByInviteRequested(_codeController.text.trim()),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.onSurface.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Entrar com código de convite',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Cole ou digite o código recebido para ingressar na comunidade.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _codeController,
                  decoration: const InputDecoration(
                    labelText: 'Código de convite',
                    hintText: 'Ex.: ABC123',
                    prefixIcon: Icon(Icons.link_rounded),
                  ),
                  textCapitalization: TextCapitalization.none,
                  autocorrect: false,
                  maxLength: 64,
                  validator: (v) {
                    if (v == null || v.trim().length < 6) {
                      return 'O código deve ter pelo menos 6 caracteres.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                FilledButton(onPressed: _submit, child: const Text('Entrar')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
