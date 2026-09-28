"use client";

import type { FunnelStep } from "@/types/Marketing";
import ChartCard from "./ChartCard";
import { fmtInt, fmtPct } from "./labels";

/** Horizontal bars, one hue; every step is a subset of the one above it. */
export default function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, steps[0]?.count ?? 0);

  return (
    <ChartCard
      title="Funnel"
      description="Students who signed up in the period, and how far each got. Each step requires the previous one."
      table={{
        columns: ["Step", "Students", "% of previous", "Drop-off"],
        rows: steps.map((s) => [s.label, fmtInt(s.count), fmtPct(s.conversion_from_previous), fmtPct(s.drop_off_pct)]),
      }}
    >
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.key} className="grid grid-cols-[9rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]">
            <span className="truncate text-xs text-gray-700" title={s.label}>{s.label}</span>
            <div className="flex items-center gap-2">
              <div className="h-6 flex-1 rounded-r bg-muted/40">
                <div
                  className="h-6 rounded-r"
                  style={{ width: `${Math.max(s.count ? 0.8 : 0, (s.count / max) * 100)}%`, backgroundColor: "var(--viz-1)" }}
                  title={`${s.label}: ${fmtInt(s.count)}`}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-xs tabular-nums">
                <span className="font-semibold text-gray-900">{fmtInt(s.count)}</span>
                {i > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({fmtPct(s.conversion_from_previous, 0)})
                  </span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {steps.length > 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Biggest drop:{" "}
          {(() => {
            const worst = steps.slice(1).reduce((a, b) => ((b.drop_off_pct ?? 0) > (a.drop_off_pct ?? 0) ? b : a));
            return worst.drop_off_pct == null ? "—" : `${fmtPct(worst.drop_off_pct, 0)} lost before “${worst.label}”`;
          })()}
        </p>
      )}
    </ChartCard>
  );
}
