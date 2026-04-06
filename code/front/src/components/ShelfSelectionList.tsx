import type { BackendShelfSummaryResponse } from "@/services";

interface ShelfSelectionListProps {
  shelves: BackendShelfSummaryResponse[];
  selectedIds: number[];
  onToggle: (shelfId: number, checked: boolean) => void;
  emptyMessage: string;
  className?: string;
}

export function ShelfSelectionList({
  shelves,
  selectedIds,
  onToggle,
  emptyMessage,
  className = "max-h-40",
}: Readonly<ShelfSelectionListProps>) {
  return (
    <div className={`${className} space-y-2 overflow-auto`}>
      {shelves.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyMessage}</p>
      ) : (
        shelves.map((shelf) => (
          <label key={shelf.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={selectedIds.includes(shelf.id)}
              onChange={(event) => onToggle(shelf.id, event.target.checked)}
            />
            <span>{shelf.name}</span>
          </label>
        ))
      )}
    </div>
  );
}
