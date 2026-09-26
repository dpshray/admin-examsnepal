"use client";

import Link from "next/link";
import type { LifecycleStage } from "@/types/Marketing";
import ChartCard from "./ChartCard";
import { STAGE_HINTS, STAGE_LABELS, fmtInt } from "./labels";

/** Current students per stage; each bar opens the student list filtered to it. */
export default function StageDistribution({
  stages,
  examTypeId,
}: {
  stages: { stage: LifecycleStage; count: number }[];
  examTypeId?: string;
}) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const href = (stage: string) =>
    `/marketing/students?stage=${stage}${examTypeId ? `&exam_type_id=${examTypeId}` : ""}`;

  return (
    <ChartCard
      title="Lifecycle stages"
      description="Where every student is right now (not date-filtered). Click a stage to see its students."
      table={{
        columns: ["Stage", "Students", "Share"],
        rows: stages.map((s) => [STAGE_LABELS[s.stage], fmtInt(s.count), total ? `${((s.count / total) * 100).toFixed(1)}%` : "—"]),
      }}
    >
      <ul className="space-y-1">
        {stages.map((s) => (
          <li key={s.stage}>
            <Link
              href={href(s.stage)}
              className="group grid grid-cols-[9rem_1fr_4rem] items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/50 sm:grid-cols-[11rem_1fr_4.5rem]"
              title={STAGE_HINTS[s.stage]}
            >
              <span className="truncate text-xs text-gray-700 group-hover:text-gray-900">{STAGE_LABELS[s.stage]}</span>
              <span className="h-4 rounded-r bg-muted/40">
                <span
                  className="block h-4 rounded-r"
                  style={{ width: `${s.count ? Math.max(0.8, (s.count / max) * 100) : 0}%`, backgroundColor: "var(--viz-1)" }}
                />
              </span>
              <span className="text-right text-xs font-medium tabular-nums text-gray-900">{fmtInt(s.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
