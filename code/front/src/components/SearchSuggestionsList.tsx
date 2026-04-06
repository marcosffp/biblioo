import React from "react";

export interface SearchSuggestionItem {
  id: string;
  title: string;
  author: string;
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
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.author}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchSuggestionsList;
