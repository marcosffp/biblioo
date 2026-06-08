import { useState } from "react";
import { BookcaseApiError, createShelf, deleteShelf, getShelfById, updateShelf } from "@/services";
import type { BackendCollectionSummaryResponse, BackendShelfResponse, BackendShelfSummaryResponse } from "@/types/api";

function toShelfSummary(shelf: BackendShelfResponse): BackendShelfSummaryResponse {
  return {
    id: shelf.id,
    name: shelf.name,
    itemCount: shelf.itemCount,
    coverPreview: shelf.coverPreview,
  };
}

function removeShelfFromCollectionPreview(
  collection: BackendCollectionSummaryResponse,
  shelfId: number,
): BackendCollectionSummaryResponse {
  const nextShelfPreviews = collection.shelfPreviews.filter((p) => p.id !== shelfId);
  return {
    ...collection,
    shelfCount: Math.max(0, collection.shelfCount - (collection.shelfPreviews.length - nextShelfPreviews.length)),
    shelfPreviews: nextShelfPreviews,
  };
}

interface UseShelfFormProps {
  setShelves: React.Dispatch<React.SetStateAction<BackendShelfSummaryResponse[]>>;
  setCollections: React.Dispatch<React.SetStateAction<BackendCollectionSummaryResponse[]>>;
  selectedShelfId: number | null;
  onShelfCreated: (shelf: BackendShelfResponse) => void;
  onDeleteActiveShelf: () => void;
  onUpdateActiveShelf: (name: string, description: string) => void;
}

export function useShelfForm({
  setShelves,
  setCollections,
  selectedShelfId,
  onShelfCreated,
  onDeleteActiveShelf,
  onUpdateActiveShelf,
}: UseShelfFormProps) {
  const [isCreateShelfModalOpen, setIsCreateShelfModalOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [createShelfError, setCreateShelfError] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);

  const [isEditShelfModalOpen, setIsEditShelfModalOpen] = useState(false);
  const [shelfToEdit, setShelfToEdit] = useState<BackendShelfSummaryResponse | null>(null);
  const [editShelfName, setEditShelfName] = useState("");
  const [editShelfDescription, setEditShelfDescription] = useState("");
  const [editShelfError, setEditShelfError] = useState("");
  const [isSavingShelfEdit, setIsSavingShelfEdit] = useState(false);

  const [isDeleteShelfModalOpen, setIsDeleteShelfModalOpen] = useState(false);
  const [shelfToDelete, setShelfToDelete] = useState<BackendShelfSummaryResponse | null>(null);
  const [deleteShelfError, setDeleteShelfError] = useState("");
  const [isDeletingShelf, setIsDeletingShelf] = useState(false);

  const handleOpenCreateShelfModal = () => {
    setIsCreateShelfModalOpen(true);
    setCreateShelfError("");
    requestAnimationFrame(() => {
      (document.getElementById("bookcase-create-shelf-name") as HTMLInputElement | null)?.focus();
    });
  };

  const handleCloseCreateShelfModal = () => {
    setIsCreateShelfModalOpen(false);
    setCreateShelfError("");
    setNewShelfName("");
    setNewShelfDescription("");
  };

  const handleCreateShelf = () => {
    const normalizedName = newShelfName.trim();
    const normalizedDescription = newShelfDescription.trim();

    if (!normalizedName) { setCreateShelfError("Informe um nome para a estante."); return; }
    if (normalizedName.length > 100) { setCreateShelfError("O nome da estante deve ter no máximo 100 caracteres."); return; }
    if (normalizedDescription.length > 300) { setCreateShelfError("A descrição deve ter no máximo 300 caracteres."); return; }

    async function createShelfAction() {
      setIsCreatingShelf(true);
      setCreateShelfError("");
      try {
        const createdShelf = await createShelf(normalizedName, normalizedDescription);
        setShelves((s) => [
          ...s,
          { id: createdShelf.id, name: createdShelf.name, itemCount: createdShelf.itemCount, coverPreview: createdShelf.coverPreview },
        ]);
        handleCloseCreateShelfModal();
        onShelfCreated(createdShelf);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setCreateShelfError("Faça login para criar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCreateShelfError(error.message);
        } else {
          setCreateShelfError("Não foi possível criar a estante. Verifique os campos e tente novamente.");
        }
      } finally {
        setIsCreatingShelf(false);
      }
    }
    void createShelfAction();
  };

  const handleOpenEditShelfModal = (shelf: BackendShelfSummaryResponse) => {
    setShelfToEdit(shelf);
    setEditShelfName(shelf.name);
    setEditShelfDescription("");
    setEditShelfError("");
    setIsEditShelfModalOpen(true);

    async function loadShelfDetails() {
      try {
        const details = await getShelfById(shelf.id);
        setEditShelfDescription(details.description ?? "");
      } catch {
        setEditShelfDescription("");
      }
    }
    void loadShelfDetails();
  };

  const handleCloseEditShelfModal = () => {
    setIsEditShelfModalOpen(false);
    setShelfToEdit(null);
    setEditShelfName("");
    setEditShelfDescription("");
    setEditShelfError("");
  };

  const handleSaveShelfEdit = () => {
    if (!shelfToEdit) return;
    const normalizedName = editShelfName.trim();
    const normalizedDescription = editShelfDescription.trim();
    const activeShelfId = shelfToEdit.id;

    if (!normalizedName) { setEditShelfError("Informe um nome para a estante."); return; }
    if (normalizedName.length > 100) { setEditShelfError("O nome da estante deve ter no máximo 100 caracteres."); return; }
    if (normalizedDescription.length > 300) { setEditShelfError("A Descrição deve ter no máximo 300 caracteres."); return; }

    async function saveShelfEditAction() {
      setIsSavingShelfEdit(true);
      setEditShelfError("");
      try {
        const updatedShelf = await updateShelf(activeShelfId, normalizedName, normalizedDescription);
        const nextSummary = toShelfSummary(updatedShelf);
        setShelves((s) => s.map((shelf) => (shelf.id === nextSummary.id ? nextSummary : shelf)));
        if (selectedShelfId === nextSummary.id) {
          onUpdateActiveShelf(nextSummary.name, updatedShelf.description?.trim() ?? "");
        }
        handleCloseEditShelfModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setEditShelfError("Faça login para editar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setEditShelfError(error.message);
        } else {
          setEditShelfError("Não foi possível editar a estante. Tente novamente.");
        }
      } finally {
        setIsSavingShelfEdit(false);
      }
    }
    void saveShelfEditAction();
  };

  const handleOpenDeleteShelfModal = (shelf: BackendShelfSummaryResponse) => {
    setShelfToDelete(shelf);
    setDeleteShelfError("");
    setIsDeleteShelfModalOpen(true);
  };

  const handleCloseDeleteShelfModal = () => {
    setIsDeleteShelfModalOpen(false);
    setShelfToDelete(null);
    setDeleteShelfError("");
  };

  const handleDeleteShelf = () => {
    if (!shelfToDelete) return;
    const activeShelfId = shelfToDelete.id;

    async function deleteShelfAction() {
      setIsDeletingShelf(true);
      setDeleteShelfError("");
      try {
        await deleteShelf(activeShelfId);
        setShelves((s) => s.filter((shelf) => shelf.id !== activeShelfId));
        setCollections((cs) => cs.map((c) => removeShelfFromCollectionPreview(c, activeShelfId)));
        if (selectedShelfId === activeShelfId) onDeleteActiveShelf();
        if (shelfToEdit?.id === activeShelfId) handleCloseEditShelfModal();
        handleCloseDeleteShelfModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setDeleteShelfError("Faça login para apagar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setDeleteShelfError(error.message);
        } else {
          setDeleteShelfError("Não foi possível apagar a estante. Tente novamente.");
        }
      } finally {
        setIsDeletingShelf(false);
      }
    }
    void deleteShelfAction();
  };

  return {
    isCreateShelfModalOpen,
    newShelfName,
    newShelfDescription,
    createShelfError,
    isCreatingShelf,
    setNewShelfName,
    setNewShelfDescription,
    handleOpenCreateShelfModal,
    handleCloseCreateShelfModal,
    handleCreateShelf,

    isEditShelfModalOpen,
    shelfToEdit,
    editShelfName,
    editShelfDescription,
    editShelfError,
    isSavingShelfEdit,
    setEditShelfName,
    setEditShelfDescription,
    handleOpenEditShelfModal,
    handleCloseEditShelfModal,
    handleSaveShelfEdit,

    isDeleteShelfModalOpen,
    shelfToDelete,
    deleteShelfError,
    isDeletingShelf,
    handleOpenDeleteShelfModal,
    handleCloseDeleteShelfModal,
    handleDeleteShelf,
  };
}
