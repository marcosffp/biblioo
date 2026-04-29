import type { ReactNode } from "react";
import React from "react";

export interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Readonly<PageHeaderProps>) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] pb-4">
      {title || subtitle ? (
        <div>
          {title ? <h1 className="m-0 text-4xl font-bold leading-tight text-[var(--text-primary)]">{title}</h1> : null}
          {subtitle ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
        </div>
      ) : (
        <div />
      )}
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
