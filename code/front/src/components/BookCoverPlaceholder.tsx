import React from "react";

export interface BookCoverPlaceholderProps {
  size?: number;
}

export function BookCoverPlaceholder({ size = 72 }: BookCoverPlaceholderProps) {
  return (
    <div
      className="flex items-center justify-center font-bold text-emerald-600 rounded-sm"
      style={{ width: size, height: size, background: "linear-gradient(180deg,#eef2ff,rgba(31,143,58,0.06))" }}
    >
      Capa
    </div>
  );
}

export default BookCoverPlaceholder;
