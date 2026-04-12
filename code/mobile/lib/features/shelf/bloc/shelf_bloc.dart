import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/shelf_repository.dart';
import 'shelf_event.dart';
import 'shelf_state.dart';

/// Bloc da feature shelf — só chama repository, nunca datasources.
class ShelfBloc extends Bloc<ShelfEvent, ShelfState> {
  final ShelfRepository _repository;

  ShelfBloc(this._repository) : super(ShelfInitial()) {
    on<ShelfLoadRequested>(_onLoad);
    on<ShelfCreateRequested>(_onCreate);
    on<ShelfUpdateRequested>(_onUpdate);
    on<ShelfDeleteRequested>(_onDelete);
    on<ShelfItemsLoadRequested>(_onLoadItems);
    on<ShelfItemAddRequested>(_onAddItem);
    on<ShelfItemRemoveRequested>(_onRemoveItem);
    on<ShelfItemProgressUpdated>(_onUpdateProgress);
    on<ShelfItemStatusChanged>(_onChangeStatus);
  }

  Future<void> _onLoad(
    ShelfLoadRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfLoading());
    try {
      final shelves = await _repository.getShelves();
      emit(ShelfLoaded(shelves));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao carregar estantes.'));
    }
  }

  Future<void> _onCreate(
    ShelfCreateRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.createShelf(
        name: event.name,
        description: event.description,
      );
      emit(ShelfMutationSuccess('Estante criada com sucesso!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao criar estante.'));
    }
  }

  Future<void> _onUpdate(
    ShelfUpdateRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.updateShelf(
        shelfId: event.shelfId,
        name: event.name,
        description: event.description,
      );
      emit(ShelfMutationSuccess('Estante atualizada!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao atualizar estante.'));
    }
  }

  Future<void> _onDelete(
    ShelfDeleteRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.deleteShelf(event.shelfId);
      emit(ShelfMutationSuccess('Estante excluída!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao excluir estante.'));
    }
  }

  Future<void> _onLoadItems(
    ShelfItemsLoadRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfItemsLoading());
    try {
      final items = await _repository.getItems(event.shelfId);
      emit(ShelfItemsLoaded(shelfId: event.shelfId, items: items));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfItemsError('Erro ao carregar itens da estante.'));
    }
  }

  Future<void> _onAddItem(
    ShelfItemAddRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.addItem(
        shelfId: event.shelfId,
        bookId: event.bookId,
        initialStatus: event.initialStatus,
      );
      emit(ShelfMutationSuccess('Livro adicionado à estante!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao adicionar livro.'));
    }
  }

  Future<void> _onRemoveItem(
    ShelfItemRemoveRequested event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.removeItem(event.shelfId, event.itemId);
      emit(ShelfMutationSuccess('Livro removido da estante!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao remover livro.'));
    }
  }

  Future<void> _onUpdateProgress(
    ShelfItemProgressUpdated event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.updateProgress(
        shelfId: event.shelfId,
        itemId: event.itemId,
        currentPage: event.currentPage,
      );
      emit(ShelfMutationSuccess('Progresso atualizado!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao atualizar progresso.'));
    }
  }

  Future<void> _onChangeStatus(
    ShelfItemStatusChanged event,
    Emitter<ShelfState> emit,
  ) async {
    emit(ShelfMutating());
    try {
      await _repository.changeStatus(
        shelfId: event.shelfId,
        itemId: event.itemId,
        newStatus: event.newStatus,
      );
      emit(ShelfMutationSuccess('Status atualizado!'));
    } catch (e, st) {
      debugPrint('[ShelfBloc] ${event.runtimeType}: $e\n$st');
      emit(ShelfError('Erro ao atualizar status.'));
    }
  }
}
