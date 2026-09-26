"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint } from "@/types/Marketing";
import ChartCard, { LegendItem } from "./ChartCard";
import { fmtDate, fmtInt } from "./labels";

const axisTick = { fontSize: 11, fill: "#6b6a66" };

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function TooltipBox({ active, payload, label, granularity }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-gray-900">
        {granularity === "week" ? `Week of ${fmtDate(label)}` : fmtDate(label)}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-gray-600">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} aria-hidden />
          <span className="flex-1">{p.name}</span>
          <span className="font-medium tabular-nums text-gray-900">{fmtInt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

const LINES = [
  { key: "registrations", name: "Registrations", color: "var(--viz-1)" },
  { key: "first_exams", name: "First exams", color: "var(--viz-2)" },
  { key: "payments", name: "Payments", color: "var(--viz-3)" },
] as const;

export function GrowthChart({ series, granularity }: { series: DailyPoint[]; granularity: "day" | "week" }) {
  return (
    <ChartCard
      title={granularity === "week" ? "Weekly registrations, first exams and payments" : "Daily registrations, first exams and payments"}
      table={{
        columns: [granularity === "week" ? "Week of" : "Date", ...LINES.map((l) => l.name)],
        rows: series.map((p) => [fmtDate(p.date), ...LINES.map((l) => fmtInt(p[l.key]))]),
      }}
    >
      <div className="mb-2 flex flex-wrap gap-4">
        {LINES.map((l) => <LegendItem key={l.key} color={l.color} label={l.name} />)}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipBox granularity={granularity} />} cursor={{ stroke: "#a3a29d", strokeDasharray: "3 3" }} />
            {LINES.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={l.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

const TYPES = [
  { key: "free", name: "Free", color: "var(--viz-1)" },
  { key: "sprint", name: "Sprint", color: "var(--viz-2)" },
  { key: "mock", name: "Mock", color: "var(--viz-3)" },
  { key: "topic", name: "Topic", color: "var(--viz-4)" },
] as const;

export function ExamMixChart({ series, granularity }: { series: DailyPoint[]; granularity: "day" | "week" }) {
  const types = TYPES.filter((t) => series.some((p) => p[t.key] > 0));
  const shown = types.length ? types : TYPES.slice(0, 3);

  return (
    <ChartCard
      title="Exam type mix"
      description="Submitted exams per type"
      table={{
        columns: [granularity === "week" ? "Week of" : "Date", ...shown.map((t) => t.name)],
        rows: series.map((p) => [fmtDate(p.date), ...shown.map((t) => fmtInt(p[t.key]))]),
      }}
    >
      <div className="mb-2 flex flex-wrap gap-4">
        {shown.map((t) => <LegendItem key={t.key} color={t.color} label={t.name} />)}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipBox granularity={granularity} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            {shown.map((t, i) => (
              <Bar
                key={t.key}
                dataKey={t.key}
                name={t.name}
                stackId="mix"
                fill={t.color}
                stroke="#fff"
                strokeWidth={1}
                radius={i === shown.length - 1 ? [4, 4, 0, 0] : 0}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
