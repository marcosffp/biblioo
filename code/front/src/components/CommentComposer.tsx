"use client";

import React, { useState } from "react";

export interface CommentComposerProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

export function CommentComposer({ placeholder = "Escreva um comentário...", onSubmit, className }: CommentComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-end gap-2 ${className ?? ""}`.trim()}>
      <textarea
        className="flex-1 min-h-[72px] rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-gray-900 dark:text-gray-100"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60"
        disabled={!value.trim()}
      >
        Enviar
      </button>
    </form>
  );
}

export default CommentComposer;

