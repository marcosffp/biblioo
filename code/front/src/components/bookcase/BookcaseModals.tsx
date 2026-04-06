import {
  BookcaseModal,
  BookDetailsCard,
  Button,
  SearchSuggestionsList,
  ShelfSelectionList,
  TextInput,
} from "@/components";
import type { BackendCollectionSummaryResponse, BackendShelfSummaryResponse } from "@/services";
import type { ShelfBook } from "@/hooks/useBookcasePage";

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
  handleAddSelectedBookToShelf: () => void;
  isSelectedBookAlreadyInShelf: boolean;
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
  isSelectedBookAlreadyInShelf,
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
              aria-label="Descricao da estante"
              placeholder="Descricao (opcional)"
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
        <BookcaseModal title="Criar colecao" onClose={handleCloseCreateCollectionModal}>
          <div className="mt-4 space-y-3">
            <TextInput
              aria-label="Nome da colecao"
              placeholder="Nome da colecao"
              value={newCollectionName}
              maxLength={100}
              onChange={(event) => setNewCollectionName(event.target.value)}
            />

            <TextInput
              aria-label="Descricao da colecao"
              placeholder="Descricao (opcional)"
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
                {isCreatingCollection ? "Criando..." : "Salvar colecao"}
              </Button>
            </div>
          </div>
        </BookcaseModal>
      ) : null}

      {isManageCollectionShelvesModalOpen ? (
        <BookcaseModal title="Adicionar estantes na colecao" onClose={handleCloseManageCollectionShelvesModal}>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{collectionToManage?.name ?? ""}</p>

          <div className="mt-3 rounded-xl border border-[var(--border-soft)] p-3">
            <ShelfSelectionList
              shelves={availableShelvesForManagedCollection}
              selectedIds={manageCollectionShelfIds}
              emptyMessage="Nenhuma estante disponivel para adicionar."
              className="max-h-44"
              onToggle={toggleManageShelfSelection}
            />
          </div>

          {manageCollectionError ? <p className="mt-3 text-sm text-red-600">{manageCollectionError}</p> : null}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveCollectionShelves} disabled={isSavingCollectionShelves}>
              {isSavingCollectionShelves ? "Salvando..." : "Salvar estantes"}
            </Button>
          </div>
        </BookcaseModal>
      ) : null}

      {isAddBookModalOpen ? (
        <BookcaseModal title="Adicionar livro na estante" onClose={handleCloseAddBookModal}>
          <div className="mt-4 space-y-3">
            <TextInput
              id="bookcase-add-search-input"
              aria-label="Pesquisar livro para adicionar"
              placeholder="Digite para buscar livro na API"
              value={addBookSearchTerm}
              onChange={(event) => setAddBookSearchTerm(event.target.value)}
            />

            <SearchSuggestionsList
              items={visibleAddBookSuggestions.map((book) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                coverUrl: book.coverUrl,
              }))}
              onSelect={handleSuggestionSelect}
            />
          </div>
        </BookcaseModal>
      ) : null}

      {isProgressModalOpen ? (
        <BookcaseModal title="Atualizar progresso" onClose={handleCloseProgressModal} maxWidthClassName="max-w-xl">
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">{progressBook?.title ?? ""}</p>

            <TextInput
              aria-label="Pagina atual"
              placeholder="Pagina atual"
              value={progressDraft}
              onChange={(event) => setProgressDraft(event.target.value)}
            />

            {typeof progressBook?.totalPages === "number" ? (
              <p className="text-xs text-[var(--text-secondary)]">Total de paginas: {progressBook.totalPages}</p>
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
        onClose={handleCloseBookDetails}
        onAddToShelf={handleAddSelectedBookToShelf}
        isAlreadyInShelf={isSelectedBookAlreadyInShelf}
        isAddingToShelf={isAddingToShelf}
        addToShelfError={addToShelfError}
      />
    </>
  );
}