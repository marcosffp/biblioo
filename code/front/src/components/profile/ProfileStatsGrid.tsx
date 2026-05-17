import React from "react";

type ProfileStatItem = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
};

export function ProfileStatsGrid({ items }: Readonly<{ items: ProfileStatItem[] }>) {
  return (
    <section className="mt-6 flex overflow-hidden rounded-xl border border-border bg-card">
      {items.map((item, i) => (
        <React.Fragment key={String(item.label)}>
          {i > 0 && <div aria-hidden="true" className="w-px self-stretch bg-border" />}
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-4">
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
