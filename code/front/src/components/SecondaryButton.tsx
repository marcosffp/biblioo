import React from "react";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryButton({ children, className, ...rest }: Readonly<SecondaryButtonProps>) {
  return (
    <button
      className={`rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white/80 px-3 py-2.5 font-semibold text-[var(--text-primary)] shadow-[0_8px_18px_rgba(15,47,44,0.08)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--brand-500)] hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
