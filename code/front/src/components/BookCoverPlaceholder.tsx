import React from "react";

export interface BookCoverPlaceholderProps {
  size?: number;
}

export function BookCoverPlaceholder({ size = 72 }: Readonly<BookCoverPlaceholderProps>) {
  return (
    <div
      className="flex items-center justify-center font-semibold text-[var(--text-secondary)] rounded-[var(--radius-md)]"
      style={{ width: size, height: size, background: "var(--brand-100)" }}
    >
      Capa
    </div>
  );
}

export default BookCoverPlaceholder;
