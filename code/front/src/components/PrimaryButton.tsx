import React from "react";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PrimaryButton({ children, className, ...rest }: Readonly<PrimaryButtonProps>) {
  return (
    <button
      className={`bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white font-bold py-2.5 px-4 rounded-[var(--radius-md)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
