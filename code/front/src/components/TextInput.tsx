"use client";

import React from "react";
import { X } from "lucide-react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export function TextInput({ label, error, icon, clearable = false, onClear, className, ...rest }: Readonly<TextInputProps>) {
  const hasValue = typeof rest.value === "string" ? rest.value.trim().length > 0 : Boolean(rest.value);

  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      {label ? <span className="font-bold text-[var(--text-primary)]">{label}</span> : null}
      <div className="relative flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-soft)] px-3 py-2.5 rounded-[var(--radius-md)]">
        {icon ? <span className="inline-flex">{icon}</span> : null}
        <input
          className={`bg-transparent outline-none border-none flex-1 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] ${clearable ? "pr-8" : ""}`.trim()}
          {...rest}
        />
        {clearable && hasValue ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="absolute right-2 rounded-full p-1 text-[var(--deep-green)] hover:bg-emerald-100"
            aria-label="Limpar campo"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </label>
  );
}

export default TextInput;
