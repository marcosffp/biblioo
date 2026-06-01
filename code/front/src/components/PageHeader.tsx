import type { ReactNode } from "react";
import React from "react";

export interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Readonly<PageHeaderProps>) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-soft)] pb-5">
      {title || subtitle ? (
        <div className="min-w-0 flex-1">
          {title ? (
            <h1 className="m-0 w-full text-3xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl">
              {title}
            </h1>
          ) : null}
          {subtitle ? <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p> : null}
        </div>
      ) : (
        <div />
      )}
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
