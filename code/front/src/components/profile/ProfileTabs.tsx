import React from "react";
import type { LucideIcon } from "lucide-react";

type ProfileTabsProps<TTab extends string> = {
    tabs: readonly TTab[];
    activeTab: TTab;
    onChange: (tab: TTab) => void;
    iconByTab: Record<TTab, LucideIcon>;
};

export function ProfileTabs<TTab extends string>({
    tabs,
    activeTab,
    onChange,
    iconByTab,
}: ProfileTabsProps<TTab>) {
    return (
        <section className="rounded-xl border border-gray-200 bg-gray-100 p-1.5">
            <div className={`grid gap-1 ${tabs.length === 2 ? "grid-cols-2" : tabs.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {tabs.map((tab) => {
                    const active = activeTab === tab;
                    const IconComponent: LucideIcon = iconByTab[tab];

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => onChange(tab)}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-white text-emerald-700 shadow-sm" : "text-gray-700 hover:bg-white/60"
                                }`}
                        >
                            <IconComponent size={16} />
                            {tab}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
