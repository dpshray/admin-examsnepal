"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isoDate } from "./labels";

const ALL = "__all__";

export const RANGE_PRESETS = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "365d", label: "12 months", days: 365 },
] as const;

export function presetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: isoDate(from), to: isoDate(to) };
}

/** One row above the charts: date range (presets + custom) and exam filter. */
export default function MarketingFilterBar({
  from,
  to,
  examTypeId,
  examTypes,
  onRangeChange,
  onExamTypeChange,
}: {
  from: string;
  to: string;
  examTypeId: string;
  examTypes: { id: number; name: string }[];
  onRangeChange: (range: { from: string; to: string }) => void;
  onExamTypeChange: (id: string) => void;
}) {
  const activePreset = RANGE_PRESETS.find((p) => {
    const r = presetRange(p.days);
    return r.from === from && r.to === to;
  })?.key;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
      <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group" aria-label="Date range">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onRangeChange(presetRange(p.days))}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium text-gray-600 transition",
              activePreset === p.key ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900",
            )}
            aria-pressed={activePreset === p.key}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Input
          type="date"
          value={from}
          max={to}
          onChange={(e) => e.target.value && onRangeChange({ from: e.target.value, to })}
          className="h-8 w-[9.5rem] text-xs"
          aria-label="From date"
        />
        <span>to</span>
        <Input
          type="date"
          value={to}
          min={from}
          onChange={(e) => e.target.value && onRangeChange({ from, to: e.target.value })}
          className="h-8 w-[9.5rem] text-xs"
          aria-label="To date"
        />
      </div>
      <Select value={examTypeId || ALL} onValueChange={(v) => onExamTypeChange(v === ALL ? "" : v)}>
        <SelectTrigger className="h-8 w-full text-xs sm:ml-auto sm:w-64"><SelectValue placeholder="All exams" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All exams</SelectItem>
          {examTypes.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
