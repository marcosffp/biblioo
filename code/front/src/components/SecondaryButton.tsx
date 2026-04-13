import React from "react";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryButton({ children, className, ...rest }: Readonly<SecondaryButtonProps>) {
  return (
    <button
      className={`bg-[var(--bg-surface)] text-[var(--brand-600)] border border-[var(--border-soft)] py-2.5 px-3 rounded-[var(--radius-md)] font-bold hover:bg-[var(--bg-soft)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
