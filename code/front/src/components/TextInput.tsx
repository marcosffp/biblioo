"use client";

import React from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function TextInput({ label, error, icon, className, ...rest }: TextInputProps) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      {label ? <span className="font-bold text-gray-900 dark:text-gray-100">{label}</span> : null}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-md">
        {icon ? <span className="inline-flex">{icon}</span> : null}
        <input className="bg-transparent outline-none border-none flex-1 text-base text-gray-900 dark:text-gray-100" {...rest} />
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </label>
  );
}

export default TextInput;
