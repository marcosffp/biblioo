"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({ label, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      {label ? <span className="font-bold text-gray-900 dark:text-gray-100">{label}</span> : null}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-md">
        <input
          type={visible ? "text" : "password"}
          className="bg-transparent outline-none border-none flex-1 text-base text-gray-900 dark:text-gray-100"
          {...rest}
        />
        <button
          type="button"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300"
          onClick={() => setVisible((s) => !s)}
          aria-label="Alternar exibição de senha"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

export default PasswordInput;
