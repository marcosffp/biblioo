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

export function SearchSuggestionsList({ items, onSelect, className }: SearchSuggestionsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden ${
        className ?? ""
      }`.trim()}
    >
      <ul className="divide-y divide-gray-100 dark:divide-slate-800">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="mt-1 text-xs text-gray-500">{item.author}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchSuggestionsList;
