"use client";

import type { ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { readingStatusOptions, useBookcasePage } from "@/hooks/useBookcasePage";
import { BookcaseResults } from "@/components/bookcase/BookcaseResults";
import { BookcaseModals } from "@/components/bookcase/BookcaseModals";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import type { BackendCollectionSummaryResponse } from "@/services";

import {
  AppShell,
  BackArrowButton,
  Button,
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
    addBookSearchError,
    addToShelfError,
    availableShelvesForManagedCollection,
    bookDetailsError,
    collectionToManage,
    createCollectionError,
    createShelfError,
    deleteShelfError,
    editShelfDescription,
    editShelfError,
    editShelfName,
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
    handleCloseDeleteShelfModal,
    handleCloseEditShelfModal,
    handleCloseCreateCollectionModal,
    handleCloseCreateShelfModal,
    handleCloseManageCollectionShelvesModal,
    handleCloseShelfBookDetails,
    handleCloseProgressModal,
    handleCreateCollection,
    handleCreateShelf,
    handleDeleteShelf,
    handleEnterCollection,
    handleEnterShelf,
    handleOpenCreateCollectionModal,
    handleOpenCreateShelfModal,
    handleOpenDeleteShelfModal,
    handleOpenEditShelfModal,
    handleOpenAddShelfToSelectedCollection,
    handleOpenShelfBookDetails,
    handleRemoveSelectedShelfBook,
    handleSelectShelfBookStatus,
    handleSaveCollectionShelves,
    handleSaveBookReview,
    handleSaveShelfEdit,
    handleSaveProgress,
    handleSetReviewComment,
    handleSetReviewRating,
    handleSuggestionSelect,
    hasNoVisibleItems,
    isAddBookModalOpen,
    isAddingToShelf,
    isSearchingAddBook,
    isBookDetailsOpen,
    isCreateCollectionModalOpen,
    isCreateShelfModalOpen,
    isDeleteShelfModalOpen,
    isDeletingShelf,
    isEditShelfModalOpen,
    isCreatingCollection,
    isCreatingShelf,
    isInsideCollection,
    isInsideShelf,
    isManageCollectionShelvesModalOpen,
    isProgressModalOpen,
    isSavingCollectionShelves,
    isSavingShelfEdit,
    isSavingShelfBookDetails,
    isRemovingBookFromShelf,
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
    shelfToDelete,
    shelfToEdit,
    activeReviewId,
    isSavingReview,
    reviewCommentDraft,
    reviewError,
    reviewRatingDraft,
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    shouldSearchAddBook,
    searchTerm,
    selectedCollectionName,
    selectedShelfId,
    selectedShelfDescription,
    selectedShelfName,
    selectedShelfBook,
    selectedSuggestionBook,
    shelfBooks,
    setAddBookSearchTerm,
    setNewCollectionDescription,
    setNewCollectionName,
    setEditShelfDescription,
    setEditShelfName,
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
  const selectedShelf = selectedShelfId === null ? undefined : shelves.find((shelf) => shelf.id === selectedShelfId);

  let pageHeaderTitle: ReactNode = "Minha Estante";
  if (isInsideShelf) {
    pageHeaderTitle = (
      <div className="inline-flex items-start gap-2">
        <BackArrowButton onClick={handleBackToShelves} ariaLabel="Voltar para estantes" />
        <div>
          <p>{selectedShelfName}</p>
          {selectedShelfDescription ? (
            <p className="mt-0.5 text-sm font-normal text-[var(--text-secondary)]">{selectedShelfDescription}</p>
          ) : null}
        </div>
      </div>
    );
  } else if (isInsideCollection) {
    pageHeaderTitle = (
      <span className="inline-flex items-center gap-2">
        <BackArrowButton onClick={handleBackToShelves} ariaLabel="Voltar para coleções" />
        <span>{selectedCollectionName}</span>
      </span>
    );
  }

  let sectionHeaderContent: ReactNode;
  if (isInsideShelf) {
    sectionHeaderContent = <SectionHeader title="Livros da estante" />;
  } else if (isInsideCollection) {
    sectionHeaderContent = <SectionHeader title="Estantes da coleção" />;
  } else {
    sectionHeaderContent = (
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
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={pageHeaderTitle}
        action={
          <div className="flex items-center gap-2">
            {!isInsideShelf && !isInsideCollection && rootViewMode === "estantes" ? (
              <PrimaryButton onClick={handleOpenCreateShelfModal} aria-label="Criar estante">
                Criar estante
              </PrimaryButton>
            ) : null}

            {!isInsideShelf && !isInsideCollection && rootViewMode === "colecoes" ? (
              <PrimaryButton onClick={handleOpenCreateCollectionModal} aria-label="Criar coleção">
                Criar coleção
              </PrimaryButton>
            ) : null}

            {isInsideCollection && !isInsideShelf ? (
              <PrimaryButton onClick={handleOpenAddShelfToSelectedCollection} aria-label="Adicionar estante na coleção">
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  <span>Adicionar estante</span>
                </span>
              </PrimaryButton>
            ) : null}

            {isInsideShelf ? (
              <>
                <Button
                  onClick={() => {
                    if (selectedShelf) {
                      handleOpenEditShelfModal(selectedShelf);
                    }
                  }}
                  disabled={!selectedShelf}
                  aria-label="Editar estante"
                  title="Editar estante"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-[var(--border-soft)] text-[var(--brand-600)] hover:bg-[var(--bg-soft)]"
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  onClick={() => {
                    if (selectedShelf) {
                      handleOpenDeleteShelfModal(selectedShelf);
                    }
                  }}
                  disabled={!selectedShelf}
                  aria-label="Apagar estante"
                  title="Apagar estante"
                  size="icon"
                  className="h-9 w-9 bg-[var(--danger-500)] text-white hover:bg-[var(--danger-600)]"
                >
                  <Trash2 size={16} />
                </Button>

                <PrimaryButton onClick={handleAddBookClick} aria-label="Adicionar livro na estante">
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    <span>Adicionar livro</span>
                  </span>
                </PrimaryButton>
              </>
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
        isEditShelfModalOpen={isEditShelfModalOpen}
        handleCloseEditShelfModal={handleCloseEditShelfModal}
        shelfToEdit={shelfToEdit}
        editShelfName={editShelfName}
        setEditShelfName={setEditShelfName}
        editShelfDescription={editShelfDescription}
        setEditShelfDescription={setEditShelfDescription}
        editShelfError={editShelfError}
        handleSaveShelfEdit={handleSaveShelfEdit}
        isSavingShelfEdit={isSavingShelfEdit}
        isDeleteShelfModalOpen={isDeleteShelfModalOpen}
        handleCloseDeleteShelfModal={handleCloseDeleteShelfModal}
        shelfToDelete={shelfToDelete}
        deleteShelfError={deleteShelfError}
        handleDeleteShelf={handleDeleteShelf}
        isDeletingShelf={isDeletingShelf}
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
        shouldSearchAddBook={shouldSearchAddBook}
        isSearchingAddBook={isSearchingAddBook}
        addBookSearchError={addBookSearchError}
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

      {sectionHeaderContent}

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

      <BookcaseResults
        loadError={loadError}
        hasNoVisibleItems={hasNoVisibleItems}
        emptyStateTitle={emptyStateTitle}
        emptyStateDescription={emptyStateDescription}
        isInsideCollection={isInsideCollection}
        isInsideShelf={isInsideShelf}
        filteredBooks={filteredBooks}
        onOpenBookDetails={handleOpenShelfBookDetails}
        rootViewMode={rootViewMode}
        filteredShelves={filteredShelves}
        onEnterShelf={handleEnterShelf}
        onOpenEditShelfModal={handleOpenEditShelfModal}
        onOpenDeleteShelfModal={handleOpenDeleteShelfModal}
        filteredCollections={filteredCollections}
        onEnterCollection={handleEnterCollection}
      />

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
        isRemovingFromShelf={isRemovingBookFromShelf}
        onRemoveFromShelf={handleRemoveSelectedShelfBook}
        errorMessage={bookDetailsError}
      />
    </AppShell>
  );
}
