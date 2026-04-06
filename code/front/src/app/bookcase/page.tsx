"use client";

import { ChevronRight, FolderOpen, Plus } from "lucide-react";
import { readingStatusOptions, useBookcasePage } from "@/hooks/useBookcasePage";
import { BookcaseResults } from "@/components/bookcase/BookcaseResults";
import { BookcaseModals } from "@/components/bookcase/BookcaseModals";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import type { BackendCollectionSummaryResponse } from "@/services";

import {
  AppShell,
  BackArrowButton,
  ChipToggle,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  TextInput,
} from "@/components";

function collectionBookCount(collection: BackendCollectionSummaryResponse): number {
  if (!collection.shelfPreviews?.length) {
    return 0;
  }

  return collection.shelfPreviews.reduce((total, shelf) => total + (shelf.itemCount ?? 0), 0);
}

export default function EstantePage() {
  const {
    addBookSearchTerm,
    addToShelfError,
    availableShelvesForManagedCollection,
    bookDetailsError,
    collectionToManage,
    createCollectionError,
    createShelfError,
    emptyStateDescription,
    emptyStateTitle,
    filteredBooks,
    filteredCollections,
    filteredShelves,
    handleAddBookClick,
    handleAddSelectedBookToShelf,
    handleBackToShelves,
    handleChangeRootViewMode,
    handleCloseAddBookModal,
    handleCloseBookDetails,
    handleCloseCreateCollectionModal,
    handleCloseCreateShelfModal,
    handleCloseManageCollectionShelvesModal,
    handleCloseShelfBookDetails,
    handleCloseProgressModal,
    handleCreateCollection,
    handleCreateShelf,
    handleEnterShelf,
    handleOpenCreateCollectionModal,
    handleOpenCreateShelfModal,
    handleOpenManageCollectionShelvesModal,
    handleOpenProgressModal,
    handleOpenShelfBookDetails,
    handleSelectShelfBookStatus,
    handleSaveCollectionShelves,
    handleSaveBookReview,
    handleSaveProgress,
    handleSetReviewComment,
    handleSetReviewRating,
    handleSuggestionSelect,
    hasNoVisibleItems,
    isAddBookModalOpen,
    isAddingToShelf,
    isBookDetailsOpen,
    isCreateCollectionModalOpen,
    isCreateShelfModalOpen,
    isCreatingCollection,
    isCreatingShelf,
    isInsideShelf,
    isManageCollectionShelvesModalOpen,
    isProgressModalOpen,
    isSavingCollectionShelves,
    isSavingShelfBookDetails,
    isSavingProgress,
    isShelfBookDetailsOpen,
    isSelectedBookAlreadyInShelf,
    loadError,
    manageCollectionError,
    manageCollectionShelfIds,
    newCollectionDescription,
    newCollectionName,
    newCollectionShelfIds,
    newShelfDescription,
    newShelfName,
    progressBook,
    progressDraft,
    progressError,
    activeReviewId,
    isSavingReview,
    reviewCommentDraft,
    reviewError,
    reviewRatingDraft,
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    searchTerm,
    selectedShelfName,
    selectedShelfBook,
    selectedSuggestionBook,
    shelfBooks,
    setAddBookSearchTerm,
    setNewCollectionDescription,
    setNewCollectionName,
    setNewShelfDescription,
    setNewShelfName,
    setProgressDraft,
    setSearchTerm,
    setStatusFilter,
    shelves,
    statusFilter,
    toggleCollectionShelfSelection,
    toggleManageShelfSelection,
    visibleAddBookSuggestions,
    handleStepShelfBookPage,
  } = useBookcasePage();

  const counts = {
    todos: shelfBooks.length,
    lendo: shelfBooks.filter((book) => book.readingStatus === "lendo" || book.readingStatus === "relendo").length,
    lido: shelfBooks.filter((book) => book.readingStatus === "lido").length,
    "quero-ler": shelfBooks.filter((book) => book.readingStatus === "quero-ler").length,
    relendo: shelfBooks.filter((book) => book.readingStatus === "relendo").length,
    abandonei: shelfBooks.filter((book) => book.readingStatus === "abandonei").length,
  };

  const visibleStatusOptions = readingStatusOptions.filter((option) => option.value !== "relendo");

  return (
    <AppShell>
      <PageHeader
        title={
          isInsideShelf ? (
            <span className="inline-flex items-center gap-2">
              <BackArrowButton onClick={handleBackToShelves} ariaLabel="Voltar para estantes" />
              <span>{selectedShelfName}</span>
            </span>
          ) : (
            "Minha Estante"
          )
        }
        action={
          <div className="flex items-center gap-2">
            {!isInsideShelf && rootViewMode === "estantes" ? (
              <PrimaryButton onClick={handleOpenCreateShelfModal} aria-label="Criar estante">
                Criar estante
              </PrimaryButton>
            ) : null}

            {!isInsideShelf && rootViewMode === "colecoes" ? (
              <PrimaryButton onClick={handleOpenCreateCollectionModal} aria-label="Criar coleção">
                Criar coleção
              </PrimaryButton>
            ) : null}

            {isInsideShelf ? (
              <PrimaryButton onClick={handleAddBookClick} aria-label="Adicionar livro na estante">
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  <span>Adicionar livro</span>
                </span>
              </PrimaryButton>
            ) : null}
          </div>
        }
      />

      {isInsideShelf ? (
        <TextInput
          id="bookcase-search-input"
          aria-label={searchInputAriaLabel}
          placeholder={searchInputPlaceholder}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      ) : null}

      <BookcaseModals
        isCreateShelfModalOpen={isCreateShelfModalOpen}
        handleCloseCreateShelfModal={handleCloseCreateShelfModal}
        newShelfName={newShelfName}
        setNewShelfName={setNewShelfName}
        newShelfDescription={newShelfDescription}
        setNewShelfDescription={setNewShelfDescription}
        createShelfError={createShelfError}
        handleCreateShelf={handleCreateShelf}
        isCreatingShelf={isCreatingShelf}
        isCreateCollectionModalOpen={isCreateCollectionModalOpen}
        handleCloseCreateCollectionModal={handleCloseCreateCollectionModal}
        newCollectionName={newCollectionName}
        setNewCollectionName={setNewCollectionName}
        newCollectionDescription={newCollectionDescription}
        setNewCollectionDescription={setNewCollectionDescription}
        shelves={shelves}
        newCollectionShelfIds={newCollectionShelfIds}
        toggleCollectionShelfSelection={toggleCollectionShelfSelection}
        createCollectionError={createCollectionError}
        handleCreateCollection={handleCreateCollection}
        isCreatingCollection={isCreatingCollection}
        isManageCollectionShelvesModalOpen={isManageCollectionShelvesModalOpen}
        handleCloseManageCollectionShelvesModal={handleCloseManageCollectionShelvesModal}
        collectionToManage={collectionToManage}
        availableShelvesForManagedCollection={availableShelvesForManagedCollection}
        manageCollectionShelfIds={manageCollectionShelfIds}
        toggleManageShelfSelection={toggleManageShelfSelection}
        manageCollectionError={manageCollectionError}
        handleSaveCollectionShelves={handleSaveCollectionShelves}
        isSavingCollectionShelves={isSavingCollectionShelves}
        isAddBookModalOpen={isAddBookModalOpen}
        handleCloseAddBookModal={handleCloseAddBookModal}
        addBookSearchTerm={addBookSearchTerm}
        setAddBookSearchTerm={setAddBookSearchTerm}
        visibleAddBookSuggestions={visibleAddBookSuggestions}
        handleSuggestionSelect={handleSuggestionSelect}
        isProgressModalOpen={isProgressModalOpen}
        handleCloseProgressModal={handleCloseProgressModal}
        progressBook={progressBook}
        progressDraft={progressDraft}
        setProgressDraft={setProgressDraft}
        progressError={progressError}
        handleSaveProgress={handleSaveProgress}
        isSavingProgress={isSavingProgress}
        isBookDetailsOpen={isBookDetailsOpen}
        selectedSuggestionBook={selectedSuggestionBook}
        handleCloseBookDetails={handleCloseBookDetails}
        handleAddSelectedBookToShelf={handleAddSelectedBookToShelf}
        isSelectedBookAlreadyInShelf={isSelectedBookAlreadyInShelf}
        isAddingToShelf={isAddingToShelf}
        addToShelfError={addToShelfError}
      />

      {isInsideShelf ? (
        <SectionHeader title="Livros da estante" />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <ChipToggle
              label="Estantes"
              active={rootViewMode === "estantes"}
              onClick={() => handleChangeRootViewMode("estantes")}
            />
            <ChipToggle
              label="Coleções"
              active={rootViewMode === "colecoes"}
              onClick={() => handleChangeRootViewMode("colecoes")}
            />
          </div>
          <SectionHeader title={rootViewMode === "estantes" ? "Suas estantes" : "Suas coleções"} />
        </div>
      )}

      {isInsideShelf ? (
        <div className="flex flex-wrap gap-2">
          {visibleStatusOptions.map((statusOption) => (
            <ChipToggle
              key={statusOption.value}
              label={`${statusOption.label} ${counts[statusOption.value] ?? 0}`}
              active={statusFilter === statusOption.value}
              onClick={() => setStatusFilter(statusOption.value)}
            />
          ))}
        </div>
      ) : null}

      {!isInsideShelf && rootViewMode === "colecoes" ? (
        loadError ? (
          <EmptyState title="Falha ao carregar coleções" description={loadError} />
        ) : filteredCollections.length === 0 ? (
          <EmptyState
            title="Você ainda não possui coleções"
            description="Crie sua primeira coleção para agrupar suas estantes."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => handleOpenManageCollectionShelvesModal(collection)}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-5 py-4 text-left transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
                aria-label={`Abrir coleção ${collection.name}`}
              >
                <div className="mb-3 flex gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`${collection.id}-${index}`}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--bg-soft)] text-[var(--text-secondary)]"
                    >
                      <FolderOpen size={14} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">{collection.name}</p>
                    <p className="mt-1 text-lg text-[var(--text-secondary)]">
                      {collectionBookCount(collection)} {collectionBookCount(collection) === 1 ? "livro" : "livros"}
                    </p>
                  </div>
                  <ChevronRight className="text-[var(--text-secondary)]" size={20} />
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <BookcaseResults
          loadError={loadError}
          hasNoVisibleItems={hasNoVisibleItems}
          emptyStateTitle={emptyStateTitle}
          emptyStateDescription={emptyStateDescription}
          isInsideShelf={isInsideShelf}
          filteredBooks={filteredBooks}
          onOpenBookDetails={handleOpenShelfBookDetails}
          rootViewMode={rootViewMode}
          filteredShelves={filteredShelves}
          onEnterShelf={handleEnterShelf}
          filteredCollections={filteredCollections}
          onOpenManageCollectionShelvesModal={handleOpenManageCollectionShelvesModal}
        />
      )}

      <ShelfBookDetailsPanel
        isOpen={isShelfBookDetailsOpen}
        book={selectedShelfBook}
        onClose={handleCloseShelfBookDetails}
        onSelectStatus={handleSelectShelfBookStatus}
        onStepPage={handleStepShelfBookPage}
        reviewRating={reviewRatingDraft}
        reviewComment={reviewCommentDraft}
        reviewExists={typeof activeReviewId === "number"}
        onChangeReviewRating={handleSetReviewRating}
        onChangeReviewComment={handleSetReviewComment}
        onSaveReview={handleSaveBookReview}
        reviewError={reviewError}
        isSavingReview={isSavingReview}
        isLoadingReview={false}
        isSaving={isSavingShelfBookDetails}
        errorMessage={bookDetailsError}
      />
    </AppShell>
  );
}