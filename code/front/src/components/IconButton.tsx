import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
}

export function IconButton({ icon, label, className, ...rest }: IconButtonProps) {
  return (
    <button
      className={`bg-transparent p-2 inline-flex items-center justify-center rounded-md text-gray-700 dark:text-gray-200 ${className ?? ""}`.trim()}
      aria-label={label}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default IconButton;
