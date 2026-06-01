import { BookOpen, Check, FolderOpen, Search } from "lucide-react";
import { useState } from "react";
import {
  BookcaseModal,
  BookDetailsCard,
  Button,
  SearchSuggestionsList,
  ShelfSelectionList,
  TextInput,
} from "@/components";
import type { BackendCollectionSummaryResponse, BackendShelfSummaryResponse } from "@/types/api";
import type { ShelfBook } from "@/hooks/useBookcasePage";

function ManageCollectionShelvesModal({
  collectionToManage,
  availableShelvesForManagedCollection,
  manageCollectionShelfIds,
  toggleManageShelfSelection,
  manageCollectionError,
  handleSaveCollectionShelves,
  isSavingCollectionShelves,
  onClose,
}: {
  collectionToManage: BackendCollectionSummaryResponse | null;
  availableShelvesForManagedCollection: BackendShelfSummaryResponse[];
  manageCollectionShelfIds: number[];
  toggleManageShelfSelection: (id: number, checked: boolean) => void;
  manageCollectionError: string;
  handleSaveCollectionShelves: () => void;
  isSavingCollectionShelves: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = availableShelvesForManagedCollection.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <BookcaseModal title="Gerenciar estantes" onClose={onClose} maxWidthClassName="max-w-md">
      {/* Collection badge */}
      <div className="mt-3 flex items-center gap-2 min-w-0">
        <FolderOpen size={14} className="shrink-0 text-[var(--brand-600)]" />
        <span className="truncate text-sm font-medium text-[var(--brand-700)]">
          {collectionToManage?.name ?? ""}
        </span>
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Pesquisar estante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-soft)] py-2 pl-8 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--brand-500)] focus:outline-none"
        />
      </div>

      {/* Counter */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Estantes disponíveis
        </p>
        {manageCollectionShelfIds.length > 0 && (
          <span className="rounded-full bg-[var(--brand-600)] px-2 py-0.5 text-xs font-semibold text-white">
            {manageCollectionShelfIds.length} selecionada{manageCollectionShelfIds.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Shelf list */}
      <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border-soft)] py-8 text-center">
            <BookOpen size={24} className="text-[var(--text-secondary)] opacity-40" />
            <p className="text-sm text-[var(--text-secondary)]">
              {search ? "Nenhuma estante encontrada." : "Nenhuma estante disponível para adicionar."}
            </p>
          </div>
        ) : (
          filtered.map((shelf) => {
            const selected = manageCollectionShelfIds.includes(shelf.id);
            return (
              <button
                key={shelf.id}
                type="button"
                onClick={() => toggleManageShelfSelection(shelf.id, !selected)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                  selected
                    ? "border-[var(--brand-500)] bg-[rgba(26,129,98,0.06)]"
                    : "border-[var(--border-soft)] bg-white hover:border-[var(--brand-300)] hover:bg-[var(--bg-soft)]"
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  selected ? "border-[var(--brand-600)] bg-[var(--brand-600)]" : "border-[var(--border-soft)]"
                }`}>
                  {selected && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
                <BookOpen size={15} className={selected ? "text-[var(--brand-600)]" : "text-[var(--text-secondary)]"} />
                <span className={`truncate text-sm font-medium ${selected ? "text-[var(--brand-700)]" : "text-[var(--text-primary)]"}`}>
                  {shelf.name}
                </span>
              </button>
            );
          })
        )}
      </div>

      {manageCollectionError ? (
        <p className="mt-3 text-sm text-red-600">{manageCollectionError}</p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-[var(--border-soft)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
        >
          Cancelar
        </button>
        <Button onClick={handleSaveCollectionShelves} disabled={isSavingCollectionShelves} className="flex-1">
          {isSavingCollectionShelves ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </BookcaseModal>
  );
}

interface BookcaseModalsProps {
  isCreateShelfModalOpen: boolean;
  handleCloseCreateShelfModal: () => void;
  newShelfName: string;
  setNewShelfName: (value: string) => void;
  newShelfDescription: string;
  setNewShelfDescription: (value: string) => void;
  createShelfError: string;
  handleCreateShelf: () => void;
  isCreatingShelf: boolean;
  isEditShelfModalOpen: boolean;
  handleCloseEditShelfModal: () => void;
  shelfToEdit: BackendShelfSummaryResponse | null;
  editShelfName: string;
  setEditShelfName: (value: string) => void;
  editShelfDescription: string;
  setEditShelfDescription: (value: string) => void;
  editShelfError: string;
  handleSaveShelfEdit: () => void;
  isSavingShelfEdit: boolean;
  isDeleteShelfModalOpen: boolean;
  handleCloseDeleteShelfModal: () => void;
  shelfToDelete: BackendShelfSummaryResponse | null;
  deleteShelfError: string;
  handleDeleteShelf: () => void;
  isDeletingShelf: boolean;
  isCreateCollectionModalOpen: boolean;
  handleCloseCreateCollectionModal: () => void;
  newCollectionName: string;
  setNewCollectionName: (value: string) => void;
  newCollectionDescription: string;
  setNewCollectionDescription: (value: string) => void;
  shelves: BackendShelfSummaryResponse[];
  newCollectionShelfIds: number[];
  toggleCollectionShelfSelection: (shelfId: number, checked: boolean) => void;
  createCollectionError: string;
  handleCreateCollection: () => void;
  isCreatingCollection: boolean;
  isManageCollectionShelvesModalOpen: boolean;
  handleCloseManageCollectionShelvesModal: () => void;
  collectionToManage: BackendCollectionSummaryResponse | null;
  availableShelvesForManagedCollection: BackendShelfSummaryResponse[];
  manageCollectionShelfIds: number[];
  toggleManageShelfSelection: (shelfId: number, checked: boolean) => void;
  manageCollectionError: string;
  handleSaveCollectionShelves: () => void;
  isSavingCollectionShelves: boolean;
  isAddBookModalOpen: boolean;
  handleCloseAddBookModal: () => void;
  addBookSearchTerm: string;
  setAddBookSearchTerm: (value: string) => void;
  shouldSearchAddBook: boolean;
  isSearchingAddBook: boolean;
  addBookSearchError: string;
  visibleAddBookSuggestions: Array<{ id: string; title: string; author: string; coverUrl?: string }>;
  handleSuggestionSelect: (suggestion: { id: string; title: string; author: string; coverUrl?: string }) => void;
  isProgressModalOpen: boolean;
  handleCloseProgressModal: () => void;
  progressBook: ShelfBook | null;
  progressDraft: string;
  setProgressDraft: (value: string) => void;
  progressError: string;
  handleSaveProgress: () => void;
  isSavingProgress: boolean;
  isBookDetailsOpen: boolean;
  selectedSuggestionBook: ShelfBook | null;
  handleCloseBookDetails: () => void;
  handleAddSelectedBookToShelf: (shelfId: number) => void;
  alreadyInShelfId?: number;
  isAddingToShelf: boolean;
  addToShelfError: string;
}

export function BookcaseModals({
  isCreateShelfModalOpen,
  handleCloseCreateShelfModal,
  newShelfName,
  setNewShelfName,
  newShelfDescription,
  setNewShelfDescription,
  createShelfError,
  handleCreateShelf,
  isCreatingShelf,
  isEditShelfModalOpen,
  handleCloseEditShelfModal,
  shelfToEdit,
  editShelfName,
  setEditShelfName,
  editShelfDescription,
  setEditShelfDescription,
  editShelfError,
  handleSaveShelfEdit,
  isSavingShelfEdit,
  isDeleteShelfModalOpen,
  handleCloseDeleteShelfModal,
  shelfToDelete,
  deleteShelfError,
  handleDeleteShelf,
  isDeletingShelf,
  isCreateCollectionModalOpen,
  handleCloseCreateCollectionModal,
  newCollectionName,
  setNewCollectionName,
  newCollectionDescription,
  setNewCollectionDescription,
  shelves,
  newCollectionShelfIds,
  toggleCollectionShelfSelection,
  createCollectionError,
  handleCreateCollection,
  isCreatingCollection,
  isManageCollectionShelvesModalOpen,
  handleCloseManageCollectionShelvesModal,
  collectionToManage,
  availableShelvesForManagedCollection,
  manageCollectionShelfIds,
  toggleManageShelfSelection,
  manageCollectionError,
  handleSaveCollectionShelves,
  isSavingCollectionShelves,
  isAddBookModalOpen,
  handleCloseAddBookModal,
  addBookSearchTerm,
  setAddBookSearchTerm,
  shouldSearchAddBook,
  isSearchingAddBook,
  addBookSearchError,
  visibleAddBookSuggestions,
  handleSuggestionSelect,
  isProgressModalOpen,
  handleCloseProgressModal,
  progressBook,
  progressDraft,
  setProgressDraft,
  progressError,
  handleSaveProgress,
  isSavingProgress,
  isBookDetailsOpen,
  selectedSuggestionBook,
  handleCloseBookDetails,
  handleAddSelectedBookToShelf,
  alreadyInShelfId,
  isAddingToShelf,
  addToShelfError,
}: Readonly<BookcaseModalsProps>) {
  return (
    <>
      {isCreateShelfModalOpen ? (
        <BookcaseModal title="Criar estante" onClose={handleCloseCreateShelfModal}>
          <div className="mt-4 space-y-3">
            <TextInput
              id="bookcase-create-shelf-name"
              aria-label="Nome da estante"
              placeholder="Nome da estante"
              value={newShelfName}
              maxLength={100}
              onChange={(event) => setNewShelfName(event.target.value)}
            />

            <TextInput
              aria-label="Descrição da estante"
              placeholder="Descrição (opcional)"
              value={newShelfDescription}
              maxLength={300}
              onChange={(event) => setNewShelfDescription(event.target.value)}
            />

            {createShelfError ? <p className="text-sm text-red-600">{createShelfError}</p> : null}

            <div className="flex justify-end">
              <Button onClick={handleCreateShelf} disabled={isCreatingShelf}>
                {isCreatingShelf ? "Criando..." : "Salvar estante"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      {isCreateCollectionModalOpen ? (
        <BookcaseModal title="Criar coleção" onClose={handleCloseCreateCollectionModal}>
          <div className="mt-4 space-y-3">
            <TextInput
              aria-label="Nome da coleção"
              placeholder="Nome da coleção"
              value={newCollectionName}
              maxLength={100}
              onChange={(event) => setNewCollectionName(event.target.value)}
            />

            <TextInput
              aria-label="Descrição da coleção"
              placeholder="Descrição (opcional)"
              value={newCollectionDescription}
              maxLength={500}
              onChange={(event) => setNewCollectionDescription(event.target.value)}
            />

            <div className="rounded-xl border border-[var(--border-soft)] p-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">Estantes iniciais (opcional)</p>
              <ShelfSelectionList
                shelves={shelves}
                selectedIds={newCollectionShelfIds}
                emptyMessage="Nenhuma estante disponivel."
                className="mt-2 max-h-40"
                onToggle={toggleCollectionShelfSelection}
              />
            </div>

            {createCollectionError ? <p className="text-sm text-red-600">{createCollectionError}</p> : null}

            <div className="flex justify-end">
              <Button onClick={handleCreateCollection} disabled={isCreatingCollection}>
                {isCreatingCollection ? "Criando..." : "Salvar coleção"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      {isEditShelfModalOpen ? (
        <BookcaseModal title="Editar estante" onClose={handleCloseEditShelfModal}>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">{shelfToEdit?.name ?? ""}</p>

            <TextInput
              aria-label="Nome da estante"
              placeholder="Nome da estante"
              value={editShelfName}
              maxLength={100}
              onChange={(event) => setEditShelfName(event.target.value)}
            />

            <TextInput
              aria-label="Descrição da estante"
              placeholder="Descrição (opcional)"
              value={editShelfDescription}
              maxLength={300}
              onChange={(event) => setEditShelfDescription(event.target.value)}
            />

            {editShelfError ? <p className="text-sm text-red-600">{editShelfError}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseEditShelfModal} disabled={isSavingShelfEdit}>
                Cancelar
              </Button>
              <Button onClick={handleSaveShelfEdit} disabled={isSavingShelfEdit}>
                {isSavingShelfEdit ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      {isDeleteShelfModalOpen ? (
        <BookcaseModal title="Apagar estante" onClose={handleCloseDeleteShelfModal} maxWidthClassName="max-w-xl">
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              Você tem certeza que deseja apagar a estante <strong>{shelfToDelete?.name ?? ""}</strong>? Esta ação também
              remove os livros dessa estante.
            </p>

            {deleteShelfError ? <p className="text-sm text-red-600">{deleteShelfError}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDeleteShelfModal} disabled={isDeletingShelf}>
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteShelf}
                disabled={isDeletingShelf}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeletingShelf ? "Apagando..." : "Apagar estante"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      {isManageCollectionShelvesModalOpen ? (
        <ManageCollectionShelvesModal
          collectionToManage={collectionToManage}
          availableShelvesForManagedCollection={availableShelvesForManagedCollection}
          manageCollectionShelfIds={manageCollectionShelfIds}
          toggleManageShelfSelection={toggleManageShelfSelection}
          manageCollectionError={manageCollectionError}
          handleSaveCollectionShelves={handleSaveCollectionShelves}
          isSavingCollectionShelves={isSavingCollectionShelves}
          onClose={handleCloseManageCollectionShelvesModal}
        />
      ) : null}

      {isAddBookModalOpen ? (
        <BookcaseModal title="Adicionar livro na estante" onClose={handleCloseAddBookModal}>
          <div className="mt-4 space-y-3">
            <TextInput
              id="bookcase-add-search-input"
              aria-label="Pesquisar livro para adicionar"
              placeholder="Digite pelo menos 2 caracteres"
              value={addBookSearchTerm}
              onChange={(event) => setAddBookSearchTerm(event.target.value)}
              clearable
              onClear={() => setAddBookSearchTerm("")}
            />

            {!shouldSearchAddBook ? (
              <p className="text-sm text-[var(--text-secondary)]">Digite pelo menos 2 caracteres para buscar.</p>
            ) : null}

            {shouldSearchAddBook && isSearchingAddBook ? (
              <p className="text-sm text-[var(--text-secondary)]">Buscando...</p>
            ) : null}

            {shouldSearchAddBook && !isSearchingAddBook && addBookSearchError ? (
              <p className="text-sm text-red-600">{addBookSearchError}</p>
            ) : null}

            {shouldSearchAddBook && !isSearchingAddBook && !addBookSearchError && visibleAddBookSuggestions.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum resultado encontrado.</p>
            ) : null}

            {shouldSearchAddBook && !isSearchingAddBook && !addBookSearchError ? (
              <SearchSuggestionsList
                items={visibleAddBookSuggestions.map((book) => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  coverUrl: book.coverUrl,
                }))}
                onSelect={handleSuggestionSelect}
              />
            ) : null}
          </div>
        </BookcaseModal>
      ) : null}

      {isProgressModalOpen ? (
        <BookcaseModal title="Atualizar progresso" onClose={handleCloseProgressModal} maxWidthClassName="max-w-xl">
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">{progressBook?.title ?? ""}</p>

            <TextInput
              aria-label="Página atual"
              placeholder="Página atual"
              value={progressDraft}
              onChange={(event) => setProgressDraft(event.target.value)}
            />

            {typeof progressBook?.totalPages === "number" ? (
              <p className="text-xs text-[var(--text-secondary)]">Total de Páginas: {progressBook.totalPages}</p>
            ) : null}

            {progressError ? <p className="text-sm text-red-600">{progressError}</p> : null}

            <div className="flex justify-end">
              <Button onClick={handleSaveProgress} disabled={isSavingProgress}>
                {isSavingProgress ? "Salvando..." : "Salvar progresso"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      <BookDetailsCard
        isOpen={isBookDetailsOpen && selectedSuggestionBook !== null}
        title={selectedSuggestionBook?.title ?? ""}
        author={selectedSuggestionBook?.author ?? ""}
        coverUrl={selectedSuggestionBook?.coverUrl}
        synopsis={selectedSuggestionBook?.synopsis}
        pageCount={selectedSuggestionBook?.totalPages}
        averageRating={selectedSuggestionBook?.rating}
        readerCount={selectedSuggestionBook?.readerCount}
        onClose={handleCloseBookDetails}
        onAddToShelf={handleAddSelectedBookToShelf}
        availableShelves={shelves.map((shelf) => ({ id: shelf.id, name: shelf.name }))}
        alreadyInShelfIds={alreadyInShelfId != null ? [alreadyInShelfId] : []}
        isAddingToShelf={isAddingToShelf}
        addToShelfError={addToShelfError}
      />
    </>
  );
}
