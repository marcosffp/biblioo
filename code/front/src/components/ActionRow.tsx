"use client";

import React from "react";

export interface ActionRowItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface ActionRowProps {
  items: ActionRowItem[];
  className?: string;
}

export function ActionRow({ items, className }: ActionRowProps) {
  return (
    <div className={`flex items-center gap-4 text-sm text-gray-500 ${className ?? ""}`.trim()}>
      {items.map((item, idx) => (
        <button
          key={`${item.label}-${idx}`}
          type="button"
          onClick={item.onClick}
          className="inline-flex items-center gap-2 hover:text-gray-700"
          disabled={!item.onClick}
        >
          {item.icon ? <span className="inline-flex items-center">{item.icon}</span> : null}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ActionRow;
