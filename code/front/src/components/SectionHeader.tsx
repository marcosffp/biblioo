import type { ReactNode } from "react";
import React from "react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: Readonly<SectionHeaderProps>) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </div>
  );
}

export default SectionHeader;
