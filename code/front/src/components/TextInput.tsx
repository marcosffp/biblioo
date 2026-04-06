"use client";

import React from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function TextInput({ label, error, icon, className, ...rest }: Readonly<TextInputProps>) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      {label ? <span className="font-bold text-[var(--text-primary)]">{label}</span> : null}
      <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-soft)] px-3 py-2.5 rounded-[var(--radius-md)]">
        {icon ? <span className="inline-flex">{icon}</span> : null}
        <input className="bg-transparent outline-none border-none flex-1 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]" {...rest} />
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </label>
  );
}

export default TextInput;
