import type { ReactNode } from "react";
import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="inline-flex items-center">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
