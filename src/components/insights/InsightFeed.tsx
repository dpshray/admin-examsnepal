"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Info, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightItem, InsightKind } from "@/types/Insights";

const KIND: Record<InsightKind, { label: string; icon: typeof Info; tone: string }> = {
  warning: { label: "Fix", icon: AlertTriangle, tone: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900" },
  opportunity: { label: "Opportunity", icon: Lightbulb, tone: "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900" },
  win: { label: "Working", icon: Trophy, tone: "bg-green-50 text-green-800 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900" },
  info: { label: "Insight", icon: Info, tone: "bg-muted text-muted-foreground ring-border" },
};

export const SOURCE_LABELS: Record<InsightItem["source"], string> = {
  search: "Google Search",
  analytics: "Website",
  facebook: "Facebook",
  cross: "Cross-channel",
};

const FILTERS: { key: InsightKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "warning", label: "Fix" },
  { key: "opportunity", label: "Opportunities" },
  { key: "win", label: "Working" },
  { key: "info", label: "Insights" },
];

/** Every rule-based finding, most important first, each with a next step. */
export default function InsightFeed({ items }: { items: InsightItem[] }) {
  const [filter, setFilter] = useState<InsightKind | "all">("all");
  const shown = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">What to do next</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Findings from your search, website and Facebook data, most important first.</p>
        </div>
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group" aria-label="Filter findings">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? items.length : items.filter((i) => i.kind === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn("rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition", filter === f.key ? "bg-background text-foreground shadow-sm" : "hover:text-foreground")}
              >
                {f.label} <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {items.length === 0 ? "No findings yet — connect a source or pick a longer period." : "Nothing in this category."}
        </p>
      ) : (
        <ul className="divide-y">
          {shown.map((item, i) => {
            const k = KIND[item.kind];
            const Icon = k.icon;
            return (
              <li key={`${item.source}-${i}`} className="flex gap-3 py-3">
                <span className={cn("mt-0.5 inline-flex h-7 w-[7.5rem] shrink-0 items-center justify-center gap-1 rounded-full px-2 text-[11px] font-medium ring-1 ring-inset", k.tone)}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {k.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
                  {item.action && (
                    <p className="mt-1.5 flex gap-1.5 text-sm text-foreground">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                      <span>{item.action}</span>
                    </p>
                  )}
                </div>
                <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{SOURCE_LABELS[item.source]}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
