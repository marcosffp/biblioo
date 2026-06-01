"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { readingStatusOptions, useBookcasePage } from "@/hooks/useBookcasePage";
import { BookcaseResults } from "@/components/bookcase/BookcaseResults";
import { BookcaseModals } from "@/components/bookcase/BookcaseModals";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";

import {
  AppShell,
  BackHeader,
  ChipToggle,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  TextInput,
} from "@/components";

export default function EstantePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledOpenBookParamsRef = useRef<string | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);

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
    handleDeleteCollection,
    handleEnterCollection,
    handleEnterShelf,
    handleEditCollection,
    handleOpenCreateCollectionModal,
    handleOpenCreateShelfModal,
    handleOpenDeleteShelfModal,
    handleOpenEditShelfModal,

    handleOpenAddShelfToSelectedCollection,

    handleOpenShelfBookDetails,
    handleOpenSuggestionBookById,
    handleRemoveSelectedShelfBook,
    handleRemoveShelfBook,
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
    selectedShelfId,
    isCreateCollectionModalOpen,
    isCreateShelfModalOpen,
    isDeleteShelfModalOpen,
    isDeletingShelf,
    isEditShelfModalOpen,
    isLoadingCollectionStats,

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
    collectionStatsError,
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
    reviewSuccessMessage,
    reviewRatingDraft,
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    shouldSearchAddBook,
    searchTerm,
    selectedCollectionName,
    selectedCollectionStats,
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
    handleSetShelfBookPage,
  } = useBookcasePage();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsPageReady(true);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const openBookDetailsFlag = searchParams.get("openBookDetails");
    const rawBookId = searchParams.get("bookId");

    if (openBookDetailsFlag !== "1" || !rawBookId) {
      return;
    }

    const bookId = Number(rawBookId);
    if (Number.isNaN(bookId)) {
      return;
    }

    const paramsKey = `${openBookDetailsFlag}:${bookId}`;
    if (handledOpenBookParamsRef.current === paramsKey) {
      return;
    }

    handledOpenBookParamsRef.current = paramsKey;
    handleOpenSuggestionBookById(bookId);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("openBookDetails");
    nextParams.delete("bookId");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [handleOpenSuggestionBookById, pathname, router, searchParams]);

  const counts = {
    todos: shelfBooks.length,
    lendo: shelfBooks.filter((book) => book.readingStatus === "lendo" || book.readingStatus === "relendo").length,
    lido: shelfBooks.filter((book) => book.readingStatus === "lido").length,
    "quero-ler": shelfBooks.filter((book) => book.readingStatus === "quero-ler").length,
    relendo: shelfBooks.filter((book) => book.readingStatus === "relendo").length,
    abandonei: shelfBooks.filter((book) => book.readingStatus === "abandonei").length,
  };

  const visibleStatusOptions = readingStatusOptions.filter((option) => option.value !== "relendo");
  let pageHeaderTitle: ReactNode = rootViewMode === "colecoes" ? "Minhas Coleções" : "Minhas Estantes";
  if (isInsideShelf) {
    pageHeaderTitle = (
      <BackHeader
        onBack={handleBackToShelves}
        ariaLabel="Voltar para biblioteca"
        title={selectedShelfName}
        subtitle={selectedShelfDescription || null}
        subtitleClassName="mt-0.5 text-sm font-normal text-[var(--text-secondary)]"
      />
    );
  } else if (isInsideCollection) {
    pageHeaderTitle = (
      <BackHeader
        onBack={handleBackToShelves}
        ariaLabel="Voltar para coleções"
        title={selectedCollectionName}
      />
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

  const shouldRenderPageHeader = isInsideShelf || isInsideCollection;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <PageHeader
          title={pageHeaderTitle}
          action={
            <div className="flex items-center gap-2">
              {!isInsideShelf && !isInsideCollection && rootViewMode === "estantes" ? (
                <PrimaryButton onClick={handleOpenCreateShelfModal} aria-label="Criar estante">
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    <span>Criar estante</span>
                  </span>
                </PrimaryButton>
              ) : null}

              {!isInsideShelf && !isInsideCollection && rootViewMode === "colecoes" ? (
                <PrimaryButton onClick={handleOpenCreateCollectionModal} aria-label="Criar coleção">
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    <span>Criar coleção</span>
                  </span>
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
      </motion.div>

      {isInsideShelf ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <TextInput
            id="bookcase-search-input"
            aria-label={searchInputAriaLabel}
            placeholder={searchInputPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            clearable
            onClear={() => setSearchTerm("")}
          />
        </motion.div>
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
        alreadyInShelfId={isSelectedBookAlreadyInShelf && selectedShelfId != null ? selectedShelfId : undefined}
        isAddingToShelf={isAddingToShelf}
        addToShelfError={addToShelfError}
      />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {sectionHeaderContent}
      </motion.div>

      {isInsideShelf ? (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {visibleStatusOptions.map((statusOption) => (
            <ChipToggle
              key={statusOption.value}
              label={`${statusOption.label} ${counts[statusOption.value] ?? 0}`}
              active={statusFilter === statusOption.value}
              onClick={() => setStatusFilter(statusOption.value)}
            />
          ))}
        </motion.div>
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
        onRemoveBook={handleRemoveShelfBook}
        rootViewMode={rootViewMode}
        filteredShelves={filteredShelves}
        onEnterShelf={handleEnterShelf}
        onOpenEditShelfModal={handleOpenEditShelfModal}
        onOpenDeleteShelfModal={handleOpenDeleteShelfModal}
        filteredCollections={filteredCollections}
        onEnterCollection={handleEnterCollection}
        onEditCollection={handleEditCollection}
        onDeleteCollection={handleDeleteCollection}
        selectedCollectionStats={selectedCollectionStats}
        isLoadingCollectionStats={isLoadingCollectionStats}
        collectionStatsError={collectionStatsError}
        selectedCollectionName={selectedCollectionName}
        onOpenAddShelfToCollection={handleOpenAddShelfToSelectedCollection}
      />

      <ShelfBookDetailsPanel
        key={selectedShelfBook?.id ?? "closed"}
        isOpen={isShelfBookDetailsOpen}
        book={selectedShelfBook}
        onClose={handleCloseShelfBookDetails}
        onSelectStatus={handleSelectShelfBookStatus}
        onStepPage={handleStepShelfBookPage}
        onSetPage={handleSetShelfBookPage}
        reviewRating={reviewRatingDraft}
        reviewComment={reviewCommentDraft}
        reviewExists={typeof activeReviewId === "number"}
        onChangeReviewRating={handleSetReviewRating}
        onChangeReviewComment={handleSetReviewComment}
        onSaveReview={handleSaveBookReview}
        reviewSuccessMessage={reviewSuccessMessage}
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