import type { ReactNode } from "react";
import React from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Readonly<PageHeaderProps>) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] pb-4">
      <div>
        <h1 className="text-4xl leading-tight font-bold m-0 text-[var(--text-primary)]">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
