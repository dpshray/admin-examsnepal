"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CohortRow } from "@/types/Marketing";
import ChartCard from "./ChartCard";
import { fmtDate, fmtInt } from "./labels";

/** One-hue sequential ramp: light = few returned, dark = many. */
const RAMP = ["--viz-seq-100", "--viz-seq-250", "--viz-seq-400", "--viz-seq-550", "--viz-seq-700"];

function cellStyle(pct: number | null) {
  if (pct == null) return {};
  const step = pct <= 0 ? -1 : Math.min(RAMP.length - 1, Math.floor(pct / 20));
  if (step < 0) return { color: "#8a8984" };
  return { backgroundColor: `var(${RAMP[step]})`, color: step >= 3 ? "#fff" : "#0b0b0b" };
}

export default function CohortGrid({
  rows,
  weeks,
  onWeeksChange,
  loading,
}: {
  rows: CohortRow[];
  weeks: number;
  onWeeksChange: (weeks: number) => void;
  loading?: boolean;
}) {
  const cols = Math.max(0, ...rows.map((r) => r.cells.length));

  return (
    <ChartCard
      title="Weekly retention"
      description="Signup week × weeks since signup: % of the cohort that took an exam that week. Ignores the date filter."
      actions={
        <Select value={String(weeks)} onValueChange={(v) => onWeeksChange(Number(v))}>
          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[8, 12, 26].map((w) => <SelectItem key={w} value={String(w)}>{w} weeks</SelectItem>)}
          </SelectContent>
        </Select>
      }
      table={{
        columns: ["Signup week", "Students", ...Array.from({ length: cols }, (_, i) => `Week ${i}`)],
        rows: rows.map((r) => [fmtDate(r.week_start), fmtInt(r.size), ...Array.from({ length: cols }, (_, i) => (r.cells[i] == null ? "" : `${r.cells[i]}%`))]),
      }}
    >
      <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
        <table className="w-full border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-1 text-left font-medium">Signup week</th>
              <th className="px-2 py-1 text-right font-medium">Students</th>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} className="px-1 py-1 text-center font-medium">W{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.week_start}>
                <td className="whitespace-nowrap px-2 py-1 text-gray-700">{fmtDate(r.week_start)}</td>
                <td className="px-2 py-1 text-right tabular-nums text-gray-900">{fmtInt(r.size)}</td>
                {Array.from({ length: cols }, (_, i) => {
                  const pct = r.cells[i];
                  return (
                    <td
                      key={i}
                      className="min-w-10 rounded px-1 py-1 text-center tabular-nums"
                      style={cellStyle(pct ?? null)}
                      title={pct == null ? undefined : `Week ${i} after signing up the week of ${fmtDate(r.week_start)}: ${pct}% took an exam`}
                    >
                      {pct == null ? "" : r.size ? `${Math.round(pct)}%` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span>0%</span>
        {RAMP.map((v) => <span key={v} className="h-2.5 w-6 rounded-sm" style={{ backgroundColor: `var(${v})` }} aria-hidden />)}
        <span>100%</span>
      </div>
    </ChartCard>
  );
}
