"use client";

import { Plus } from "lucide-react";
import { readingStatusOptions, useBookcasePage } from "@/hooks/useBookcasePage";
import { BookcaseResults } from "@/components/bookcase/BookcaseResults";
import { BookcaseModals } from "@/components/bookcase/BookcaseModals";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";

import {
  AppShell,
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
    handleOpenShelfBookDetails,
    handleSelectShelfBookStatus,
    handleSaveCollectionShelves,
    handleSaveProgress,
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
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    searchTerm,
    selectedShelfName,
    selectedShelfBook,
    selectedSuggestionBook,
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

  return (
    <AppShell>
      <PageHeader
        title="Minha Estante"
        action={
          <div className="flex items-center gap-2">
            {!isInsideShelf && rootViewMode === "estantes" ? (
              <SecondaryButton onClick={handleOpenCreateShelfModal} aria-label="Criar estante">
                Criar estante
              </SecondaryButton>
            ) : null}

            {!isInsideShelf && rootViewMode === "colecoes" ? (
              <SecondaryButton onClick={handleOpenCreateCollectionModal} aria-label="Criar colecao">
                Criar colecao
              </SecondaryButton>
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
        <div className="flex items-center justify-between gap-2">
          <SectionHeader title={`Estante: ${selectedShelfName}`} />
          <SecondaryButton onClick={handleBackToShelves} aria-label="Voltar para lista de estantes">
            Voltar para estantes
          </SecondaryButton>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <ChipToggle
              label="Estantes"
              active={rootViewMode === "estantes"}
              onClick={() => handleChangeRootViewMode("estantes")}
            />
            <ChipToggle
              label="Colecoes"
              active={rootViewMode === "colecoes"}
              onClick={() => handleChangeRootViewMode("colecoes")}
            />
          </div>
          <SectionHeader title={rootViewMode === "estantes" ? "Suas estantes" : "Suas colecoes"} />
        </div>
      )}

      {isInsideShelf ? (
        <div className="flex flex-wrap gap-2">
          {readingStatusOptions.map((statusOption) => (
            <ChipToggle
              key={statusOption.value}
              label={statusOption.label}
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
        isSaving={isSavingShelfBookDetails}
        errorMessage={bookDetailsError}
      />
    </AppShell>
  );
}
