import React from "react";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PrimaryButton({ children, className, ...rest }: PrimaryButtonProps) {
  return (
    <button
      className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-60 disabled:cursor-not-allowed ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
