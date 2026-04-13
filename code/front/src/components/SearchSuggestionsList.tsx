import React from "react";

export interface SearchSuggestionItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
}

export interface SearchSuggestionsListProps {
  items: SearchSuggestionItem[];
  onSelect: (item: SearchSuggestionItem) => void;
  className?: string;
}

export function SearchSuggestionsList({ items, onSelect, className }: Readonly<SearchSuggestionsListProps>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] overflow-hidden ${
        className ?? ""
      }`.trim()}
    >
      <ul className="divide-y divide-[var(--border-soft)]/60">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--bg-soft)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-14 w-10 shrink-0 rounded-md border border-[var(--border-soft)] bg-[var(--bg-soft)] bg-cover bg-center"
                  style={item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : undefined}
                  aria-hidden
                >
                  {item.coverUrl ? null : (
                    <div className="flex h-full items-center justify-center text-[10px] text-[var(--text-secondary)]">Sem capa</div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-1">{item.author}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchSuggestionsList;
