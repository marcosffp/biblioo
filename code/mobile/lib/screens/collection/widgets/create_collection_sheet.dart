import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CreateCollectionSheet extends StatefulWidget {
  final Collection? editingCollection;

  const CreateCollectionSheet({super.key, this.editingCollection});

  @override
  State<CreateCollectionSheet> createState() => _CreateCollectionSheetState();
}

class _CreateCollectionSheetState extends State<CreateCollectionSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;

  bool get _isEditing => widget.editingCollection != null;

  @override
  void initState() {
    super.initState();
    _nameController =
        TextEditingController(text: widget.editingCollection?.name ?? '');
    _descriptionController =
        TextEditingController(text: widget.editingCollection?.description ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurfaceVariant
                        .withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _isEditing ? 'Editar coleção' : 'Nova coleção',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                autofocus: true,
                maxLength: 100,
                decoration: const InputDecoration(
                  labelText: 'Nome da coleção',
                  hintText: 'Ex.: Box O Senhor dos Anéis',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'O nome é obrigatório.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                maxLength: 500,
                decoration: const InputDecoration(
                  labelText: 'Descrição (opcional)',
                  hintText: 'Detalhe sobre a coleção...',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submit,
                  child: Text(_isEditing ? 'Salvar' : 'Criar coleção'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final name = _nameController.text.trim();
    final desc = _descriptionController.text.trim();

    if (_isEditing) {
      context.read<CollectionBloc>().add(CollectionUpdateRequested(
            id: widget.editingCollection!.id,
            name: name,
            description: desc.isEmpty ? null : desc,
          ));
    } else {
      context.read<CollectionBloc>().add(CollectionCreateRequested(
            name: name,
            description: desc.isEmpty ? null : desc,
          ));
    }
    Navigator.pop(context);
  }
}
