"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, className, disabled, ...rest }: Readonly<PasswordInputProps>) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      {label ? <span className="font-bold text-[var(--text-primary)]">{label}</span> : null}
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white/80 px-3 py-2.5 shadow-sm transition focus-within:border-[var(--brand-500)] focus-within:ring-2 focus-within:ring-[rgba(63,195,167,0.25)]">
        <input
          type={visible ? "text" : "password"}
          disabled={disabled}
          className="flex-1 border-none bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          {...rest}
        />
        <button
          type="button"
          className="p-1 rounded-md text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setVisible((s) => !s)}
          disabled={disabled}
          aria-label="Alternar exibição de senha"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </label>
  );
}

export default PasswordInput;
