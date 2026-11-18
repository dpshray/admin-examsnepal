"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { LegendItem } from "@/components/marketing/ChartCard";
import { fmtDate, fmtInt } from "@/components/marketing/labels";
import { axisTick, shortDate } from "./shared";

interface Series {
  key: string;
  name: string;
  color: string;
}

function TooltipBox({ active, payload, label, dateLabel = true }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{dateLabel ? fmtDate(label) : label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} aria-hidden />
          <span className="flex-1">{p.name}</span>
          <span className="font-medium tabular-nums text-foreground">{fmtInt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/** Daily trend; all series share one scale (never a second axis). */
export function TrendChart({ title, description, data, series }: { title: string; description?: string; data: Record<string, any>[]; series: Series[] }) {
  return (
    <ChartCard
      title={title}
      description={description}
      table={{ columns: ["Date", ...series.map((s) => s.name)], rows: data.map((p) => [fmtDate(p.date), ...series.map((s) => fmtInt(p[s.key]))]) }}
    >
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-4">
          {series.map((s) => <LegendItem key={s.key} color={s.color} label={s.name} />)}
        </div>
      )}
      <div className="h-60">
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-xs text-muted-foreground">No data in this period</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v) => fmtInt(v)} />
              <Tooltip content={<TooltipBox />} cursor={{ stroke: "#a3a29d", strokeDasharray: "3 3" }} />
              {series.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

/** Horizontal bars for a ranked category list (one measure). */
export function RankBars({ title, description, rows, valueLabel, format = fmtInt }: {
  title: string;
  description?: string;
  rows: { label: string; value: number; note?: string }[];
  valueLabel: string;
  format?: (v: number) => string;
}) {
  return (
    <ChartCard
      title={title}
      description={description}
      table={{ columns: ["", valueLabel], rows: rows.map((r) => [r.label, format(r.value)]) }}
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No data in this period</p>
      ) : (
        <div style={{ height: Math.max(120, rows.length * 34) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={6}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" width={130} tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={({ active, payload }: any) =>
                  active && payload?.length ? (
                    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-medium text-foreground">{payload[0].payload.label}</p>
                      <p className="text-muted-foreground">{valueLabel}: <span className="font-medium text-foreground">{format(payload[0].value)}</span></p>
                      {payload[0].payload.note && <p className="text-muted-foreground">{payload[0].payload.note}</p>}
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="value" name={valueLabel} fill="var(--viz-1)" radius={[0, 4, 4, 0]} maxBarSize={20}
                label={{ position: "right", fontSize: 11, fill: "#6b6a66", formatter: (v: number) => format(v) }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SEQ = ["var(--viz-seq-100)", "var(--viz-seq-250)", "var(--viz-seq-400)", "var(--viz-seq-550)", "var(--viz-seq-700)"];
const hourLabel = (h: number) => (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`);

/** Day × hour activity grid, one-hue ramp in five steps. */
export function ActivityHeatmap({ grid, title, description }: { grid: number[][]; title: string; description?: string }) {
  const max = Math.max(1, ...grid.flat());
  const step = (v: number) => (v <= 0 ? null : SEQ[Math.min(4, Math.floor((v / max) * 5))]);
  return (
    <ChartCard
      title={title}
      description={description}
      table={{ columns: ["Day", ...Array.from({ length: 24 }, (_, h) => hourLabel(h))], rows: grid.map((r, d) => [DAYS[d], ...r.map((v) => fmtInt(v))]) }}
    >
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] gap-[2px]" style={{ gridTemplateColumns: "36px repeat(24, minmax(0, 1fr))" }}>
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center text-[10px] text-muted-foreground">{h % 3 === 0 ? hourLabel(h) : ""}</span>
          ))}
          {grid.map((row, d) => (
            <div key={d} className="contents">
              <span className="pr-1 text-right text-[11px] leading-5 text-muted-foreground">{DAYS[d]}</span>
              {row.map((v, h) => (
                <span
                  key={h}
                  title={`${DAYS[d]} ${hourLabel(h)}m: ${fmtInt(v)} active users`}
                  className="h-5 rounded-[3px] bg-muted/50 transition hover:ring-2 hover:ring-foreground/40"
                  style={step(v) ? { backgroundColor: step(v)! } : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        Fewer
        {SEQ.map((c) => <span key={c} className="h-2.5 w-5 rounded-sm" style={{ backgroundColor: c }} aria-hidden />)}
        More
      </div>
    </ChartCard>
  );
}
