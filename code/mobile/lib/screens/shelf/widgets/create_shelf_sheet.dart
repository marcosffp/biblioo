import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Bottom sheet para criar ou editar uma estante.
/// Se [editingShelf] for fornecido, preenche os campos para edição.
class CreateShelfSheet extends StatefulWidget {
  final Shelf? editingShelf;

  const CreateShelfSheet({super.key, this.editingShelf});

  @override
  State<CreateShelfSheet> createState() => _CreateShelfSheetState();
}

class _CreateShelfSheetState extends State<CreateShelfSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;

  bool get _isEditing => widget.editingShelf != null;

  @override
  void initState() {
    super.initState();
    _nameController =
        TextEditingController(text: widget.editingShelf?.name ?? '');
    _descriptionController =
        TextEditingController(text: widget.editingShelf?.description ?? '');
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
              // ── Handle ──
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurfaceVariant.withValues(
                      alpha: 0.3,
                    ),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Título ──
              Text(
                _isEditing ? 'Editar estante' : 'Nova estante',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),

              // ── Nome ──
              TextFormField(
                controller: _nameController,
                autofocus: true,
                maxLength: 100,
                decoration: const InputDecoration(
                  labelText: 'Nome da estante',
                  hintText: 'Ex.: Desejos de Leitura',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'O nome é obrigatório.';
                  }
                  if (value.length > 100) {
                    return 'Máximo de 100 caracteres.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // ── Descrição ──
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                maxLength: 300,
                decoration: const InputDecoration(
                  labelText: 'Descrição (opcional)',
                  hintText: 'Descreva sua estante...',
                ),
                validator: (value) {
                  if (value != null && value.length > 300) {
                    return 'Máximo de 300 caracteres.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // ── Botão ──
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submit,
                  child: Text(_isEditing ? 'Salvar' : 'Criar estante'),
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
    final description = _descriptionController.text.trim();

    if (_isEditing) {
      context.read<ShelfBloc>().add(ShelfUpdateRequested(
            shelfId: widget.editingShelf!.id,
            name: name,
            description: description.isEmpty ? null : description,
          ));
    } else {
      context.read<ShelfBloc>().add(ShelfCreateRequested(
            name: name,
            description: description.isEmpty ? null : description,
          ));
    }

    Navigator.pop(context);
  }
}
