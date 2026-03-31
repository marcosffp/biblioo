import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={`mt-1.5 h-12 w-full rounded-xl bg-gradient-to-r
      from-[var(--brand-500)] via-[#238f40] to-[var(--brand-600)] 
      text-[0.97rem] font-semibold tracking-[0.01em] 
      text-white shadow-[0_8px_16px_rgba(23,117,47,0.24)] transition duration-200 
      hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(23,117,47,0.3)] 
      focus-visible:shadow-[0_0_0_3px_rgba(31,143,58,0.22)] active:translate-y-0 disabled:cursor-not-allowed 
      disabled:opacity-70 disabled:hover:translate-y-0 ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;