import { useEffect, useState } from "react";
import {
  addShelfToCollection,
  BookcaseApiError,
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollectionStatistics,
  updateCollection,
} from "@/services";
import type {
  BackendCollectionResponse,
  BackendCollectionStatisticsResponse,
  BackendCollectionSummaryResponse,
  BackendShelfSummaryResponse,
} from "@/types/api";
import type { RootViewMode } from "./useBookcasePage";

function toCollectionSummary(
  collection: BackendCollectionSummaryResponse | BackendCollectionResponse,
): BackendCollectionSummaryResponse {
  return {
    id: collection.id,
    name: collection.name,
    shelfCount: collection.shelfCount,
    shelfPreviews: collection.shelfPreviews ?? [],
  };
}

function addSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.includes(nextId) ? currentIds : [...currentIds, nextId];
}

function removeSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.filter((id) => id !== nextId);
}

interface UseCollectionFormProps {
  shelves: BackendShelfSummaryResponse[];
  collections: BackendCollectionSummaryResponse[];
  setCollections: React.Dispatch<React.SetStateAction<BackendCollectionSummaryResponse[]>>;
  selectedCollectionId: number | null;
  setSelectedCollectionId: React.Dispatch<React.SetStateAction<number | null>>;
  setRootViewMode: React.Dispatch<React.SetStateAction<RootViewMode>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export function useCollectionForm({
  shelves,
  collections,
  setCollections,
  selectedCollectionId,
  setSelectedCollectionId,
  setRootViewMode,
  setSearchTerm,
}: UseCollectionFormProps) {
  const [selectedCollectionStats, setSelectedCollectionStats] =
    useState<BackendCollectionStatisticsResponse | null>(null);
  const [isLoadingCollectionStats, setIsLoadingCollectionStats] = useState(false);
  const [collectionStatsError, setCollectionStatsError] = useState("");

  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCollectionShelfIds, setNewCollectionShelfIds] = useState<number[]>([]);
  const [createCollectionError, setCreateCollectionError] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const [isManageCollectionShelvesModalOpen, setIsManageCollectionShelvesModalOpen] = useState(false);
  const [collectionToManage, setCollectionToManage] = useState<BackendCollectionSummaryResponse | null>(null);
  const [manageCollectionShelfIds, setManageCollectionShelfIds] = useState<number[]>([]);
  const [manageCollectionError, setManageCollectionError] = useState("");
  const [isSavingCollectionShelves, setIsSavingCollectionShelves] = useState(false);

  const selectedCollection =
    selectedCollectionId === null ? null : (collections.find((c) => c.id === selectedCollectionId) ?? null);

  const availableShelvesForManagedCollection = collectionToManage
    ? shelves.filter((shelf) => !collectionToManage.shelfPreviews.some((p) => p.id === shelf.id))
    : [];

  useEffect(() => {
    if (selectedCollectionId === null) {
      setSelectedCollectionStats(null);
      setCollectionStatsError("");
      setIsLoadingCollectionStats(false);
      return;
    }

    const activeCollectionId = selectedCollectionId;
    let isCancelled = false;

    async function loadCollectionStatistics() {
      setIsLoadingCollectionStats(true);
      setCollectionStatsError("");
      try {
        const stats = await getCollectionStatistics(activeCollectionId);
        if (!isCancelled) setSelectedCollectionStats(stats);
      } catch (error) {
        if (isCancelled) return;
        setSelectedCollectionStats(null);
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setCollectionStatsError("Faça login para carregar as estatísticas da coleção.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCollectionStatsError(error.message);
        } else {
          setCollectionStatsError("Não foi possível carregar as estatísticas da coleção.");
        }
      } finally {
        if (!isCancelled) setIsLoadingCollectionStats(false);
      }
    }

    void loadCollectionStatistics();
    return () => {
      isCancelled = true;
    };
  }, [selectedCollectionId]);

  const resetStats = () => {
    setSelectedCollectionStats(null);
    setCollectionStatsError("");
  };

  const handleOpenCreateCollectionModal = () => {
    setIsCreateCollectionModalOpen(true);
    setCreateCollectionError("");
  };

  const handleCloseCreateCollectionModal = () => {
    setIsCreateCollectionModalOpen(false);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setNewCollectionShelfIds([]);
    setCreateCollectionError("");
  };

  const handleCreateCollection = () => {
    const normalizedName = newCollectionName.trim();
    const normalizedDescription = newCollectionDescription.trim();

    if (!normalizedName) { setCreateCollectionError("Informe um nome para a coleção."); return; }
    if (normalizedName.length > 100) { setCreateCollectionError("O nome da coleção deve ter no máximo 100 caracteres."); return; }
    if (normalizedDescription.length > 500) { setCreateCollectionError("A descrição da coleção deve ter no máximo 500 caracteres."); return; }

    async function createCollectionAction() {
      setIsCreatingCollection(true);
      setCreateCollectionError("");
      try {
        const createdCollection = await createCollection(normalizedName, normalizedDescription, newCollectionShelfIds);
        setCollections((cs) => [...cs, toCollectionSummary(createdCollection)]);
        setRootViewMode("colecoes");
        setSearchTerm("");
        handleCloseCreateCollectionModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setCreateCollectionError("Faça login para criar coleções.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCreateCollectionError(error.message);
        } else {
          setCreateCollectionError("Não foi possível criar a coleção. Tente novamente.");
        }
      } finally {
        setIsCreatingCollection(false);
      }
    }
    void createCollectionAction();
  };

  const handleOpenManageCollectionShelvesModal = (collection: BackendCollectionSummaryResponse) => {
    setCollectionToManage(collection);
    setManageCollectionShelfIds([]);
    setManageCollectionError("");
    setIsManageCollectionShelvesModalOpen(true);
  };

  const handleCloseManageCollectionShelvesModal = () => {
    setCollectionToManage(null);
    setManageCollectionShelfIds([]);
    setManageCollectionError("");
    setIsManageCollectionShelvesModalOpen(false);
  };

  const handleSaveCollectionShelves = () => {
    if (!collectionToManage) return;
    const activeCollectionId = collectionToManage.id;

    if (manageCollectionShelfIds.length === 0) {
      setManageCollectionError("Selecione pelo menos uma estante para adicionar.");
      return;
    }

    async function saveCollectionShelvesAction() {
      setIsSavingCollectionShelves(true);
      setManageCollectionError("");
      try {
        let updatedCollection: BackendCollectionResponse | null = null;
        for (const shelfId of manageCollectionShelfIds) {
          updatedCollection = await addShelfToCollection(activeCollectionId, shelfId);
        }
        if (updatedCollection) {
          const nextSummary = toCollectionSummary(updatedCollection);
          setCollections((cs) => cs.map((c) => (c.id === nextSummary.id ? nextSummary : c)));
          try {
            const refreshedStats = await getCollectionStatistics(nextSummary.id);
            setSelectedCollectionStats(refreshedStats);
            setCollectionStatsError("");
          } catch {
            setSelectedCollectionStats(null);
            setCollectionStatsError("Não foi possível atualizar as estatísticas da coleção.");
          }
        }
        handleCloseManageCollectionShelvesModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setManageCollectionError("Faça login para editar coleções.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setManageCollectionError(error.message);
        } else {
          setManageCollectionError("Não foi possível adicionar estantes na coleção.");
        }
      } finally {
        setIsSavingCollectionShelves(false);
      }
    }
    void saveCollectionShelvesAction();
  };

  const handleEditCollection = (collection: BackendCollectionSummaryResponse) => {
    async function editCollectionAction() {
      try {
        const collectionDetails = await getCollectionById(collection.id);
        const nextNameInput = window.prompt("Nome da coleção", collectionDetails.name ?? collection.name);
        if (nextNameInput === null) return;
        const normalizedName = nextNameInput.trim();
        if (!normalizedName) { window.alert("Informe um nome para a coleção."); return; }
        if (normalizedName.length > 100) { window.alert("O nome da coleção deve ter no máximo 100 caracteres."); return; }
        const nextDescriptionInput = window.prompt("Descrição da coleção (opcional)", collectionDetails.description ?? "");
        if (nextDescriptionInput === null) return;
        const normalizedDescription = nextDescriptionInput.trim();
        if (normalizedDescription.length > 500) { window.alert("A descrição da coleção deve ter no máximo 500 caracteres."); return; }
        const updatedCollection = await updateCollection(collection.id, normalizedName, normalizedDescription);
        const nextSummary = toCollectionSummary(updatedCollection);
        setCollections((cs) => cs.map((c) => (c.id === nextSummary.id ? nextSummary : c)));
      } catch (error) {
        window.alert(
          error instanceof BookcaseApiError && error.message ? error.message : "Não foi possível editar a coleção.",
        );
      }
    }
    void editCollectionAction();
  };

  const handleDeleteCollection = (collection: BackendCollectionSummaryResponse) => {
    if (!window.confirm(`Deseja apagar a coleção "${collection.name}"?`)) return;
    async function deleteCollectionAction() {
      try {
        await deleteCollection(collection.id);
        setCollections((cs) => cs.filter((c) => c.id !== collection.id));
        if (selectedCollectionId === collection.id) {
          setSelectedCollectionId(null);
          resetStats();
        }
      } catch (error) {
        window.alert(
          error instanceof BookcaseApiError && error.message ? error.message : "Não foi possível apagar a coleção.",
        );
      }
    }
    void deleteCollectionAction();
  };

  const handleEnterCollection = (collection: BackendCollectionSummaryResponse) => {
    setSelectedCollectionId(collection.id);
    setRootViewMode("colecoes");
    setSearchTerm("");
    setCollectionStatsError("");
  };

  const handleOpenAddShelfToSelectedCollection = () => {
    if (selectedCollection) handleOpenManageCollectionShelvesModal(selectedCollection);
  };

  return {
    selectedCollectionStats,
    isLoadingCollectionStats,
    collectionStatsError,
    resetStats,

    isCreateCollectionModalOpen,
    newCollectionName,
    newCollectionDescription,
    newCollectionShelfIds,
    createCollectionError,
    isCreatingCollection,
    setNewCollectionName,
    setNewCollectionDescription,
    setNewCollectionShelfIds: (updater: (ids: number[]) => number[]) =>
      setNewCollectionShelfIds((ids) => updater(ids)),
    handleOpenCreateCollectionModal,
    handleCloseCreateCollectionModal,
    handleCreateCollection,
    toggleCollectionShelfSelection: (shelfId: number, checked: boolean) =>
      setNewCollectionShelfIds((ids) => (checked ? addSelectedId(ids, shelfId) : removeSelectedId(ids, shelfId))),

    isManageCollectionShelvesModalOpen,
    collectionToManage,
    manageCollectionShelfIds,
    manageCollectionError,
    isSavingCollectionShelves,
    availableShelvesForManagedCollection,
    setManageCollectionShelfIds,
    handleOpenManageCollectionShelvesModal,
    handleCloseManageCollectionShelvesModal,
    handleSaveCollectionShelves,
    toggleManageShelfSelection: (shelfId: number, checked: boolean) =>
      setManageCollectionShelfIds((ids) => (checked ? addSelectedId(ids, shelfId) : removeSelectedId(ids, shelfId))),

    handleEditCollection,
    handleDeleteCollection,
    handleEnterCollection,
    handleOpenAddShelfToSelectedCollection,
  };
}
