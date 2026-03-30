import type { ReactNode } from "react";
import React from "react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold m-0 text-gray-900 dark:text-gray-100">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </div>
  );
}

export default SectionHeader;
