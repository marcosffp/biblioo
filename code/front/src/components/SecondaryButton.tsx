import React from "react";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryButton({ children, className, ...rest }: SecondaryButtonProps) {
  return (
    <button
      className={`bg-transparent text-indigo-600 border border-indigo-100 py-2 px-3 rounded-md font-bold disabled:opacity-60 disabled:cursor-not-allowed ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
