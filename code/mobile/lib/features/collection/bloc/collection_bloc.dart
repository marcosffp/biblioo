import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/collection_repository.dart';
import 'collection_event.dart';
import 'collection_state.dart';

class CollectionBloc extends Bloc<CollectionEvent, CollectionState> {
  final CollectionRepository _repository;

  CollectionBloc(this._repository) : super(CollectionInitial()) {
    on<CollectionLoadRequested>(_onLoad);
    on<CollectionCreateRequested>(_onCreate);
    on<CollectionUpdateRequested>(_onUpdate);
    on<CollectionDeleteRequested>(_onDelete);
    on<CollectionAddShelfRequested>(_onAddShelf);
    on<CollectionRemoveShelfRequested>(_onRemoveShelf);
  }

  Future<void> _onLoad(
    CollectionLoadRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionLoading());
    try {
      final collections = await _repository.getCollections();
      emit(CollectionLoaded(collections));
    } catch (e) {
      emit(CollectionError('Erro ao carregar coleções.'));
    }
  }

  Future<void> _onCreate(
    CollectionCreateRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionMutating());
    try {
      await _repository.createCollection(
        name: event.name,
        description: event.description,
        initialShelfIds: event.initialShelfIds,
      );
      emit(CollectionMutationSuccess('Coleção criada com sucesso!'));
    } catch (e) {
      emit(CollectionError('Erro ao criar coleção.'));
    }
  }

  Future<void> _onUpdate(
    CollectionUpdateRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionMutating());
    try {
      await _repository.updateCollection(
        id: event.id,
        name: event.name,
        description: event.description,
      );
      emit(CollectionMutationSuccess('Coleção atualizada!'));
    } catch (e) {
      emit(CollectionError('Erro ao atualizar coleção.'));
    }
  }

  Future<void> _onDelete(
    CollectionDeleteRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionMutating());
    try {
      await _repository.deleteCollection(event.id);
      emit(CollectionMutationSuccess('Coleção excluída!'));
    } catch (e) {
      emit(CollectionError('Erro ao excluir coleção.'));
    }
  }

  Future<void> _onAddShelf(
    CollectionAddShelfRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionMutating());
    try {
      await _repository.addShelfToCollection(event.collectionId, event.shelfId);
      emit(CollectionMutationSuccess('Estante adicionada à coleção!'));
    } catch (e) {
      emit(CollectionError('Erro ao adicionar estante.'));
    }
  }

  Future<void> _onRemoveShelf(
    CollectionRemoveShelfRequested event,
    Emitter<CollectionState> emit,
  ) async {
    emit(CollectionMutating());
    try {
      await _repository.removeShelfFromCollection(event.collectionId, event.shelfId);
      emit(CollectionMutationSuccess('Estante removida da coleção!'));
    } catch (e) {
      emit(CollectionError('Erro ao remover estante.'));
    }
  }
}
