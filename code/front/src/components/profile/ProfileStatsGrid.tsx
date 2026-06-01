import React from "react";

type ProfileStatItem = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
};

export function ProfileStatsGrid({ items }: Readonly<{ items: ProfileStatItem[] }>) {
  return (
    <section className="flex rounded-xl border border-border bg-card">
      {items.map((item, i) => (
        <React.Fragment key={String(item.label)}>
          {i > 0 && <div aria-hidden="true" className="w-px self-stretch bg-border" />}
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-4">
            {item.tooltip ? (
              <div className="group absolute right-2 top-2">
                <span className="flex h-3.5 w-3.5 cursor-default items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground">
                  ?
                </span>
                <div className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 w-44 rounded-lg bg-gray-800 px-2.5 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.tooltip}
                  <div className="absolute right-2 top-full border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5">
              {item.icon}
              <span className="text-xl font-bold tabular-nums text-foreground">{item.value}</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </section>
  );
}

export default ProfileStatsGrid;
