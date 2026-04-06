"use client";

import { Plus } from "lucide-react";
import { readingStatusOptions, useBookcasePage } from "@/hooks/useBookcasePage";
import { BookcaseResults } from "@/components/bookcase/BookcaseResults";
import { BookcaseModals } from "@/components/bookcase/BookcaseModals";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";

import {
  AppShell,
  BackArrowButton,
  BookCoverPlaceholder,
  ChipToggle,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  TextInput,
} from "@/components";

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

  const readingNowBooks = shelfBooks.filter((book) => book.readingStatus === "lendo" || book.readingStatus === "relendo");
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