"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus, PlugZap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, fmtInt } from "@/components/marketing/labels";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/types/Marketing";
import type { SourceResult } from "@/types/Insights";

export type KpiFormat = "int" | "pct" | "dec" | "duration" | "position";

export function fmtValue(v: number | null | undefined, format: KpiFormat) {
  if (v == null) return "—";
  switch (format) {
    case "pct":
      return `${Number(v).toFixed(1)}%`;
    case "dec":
      return Number(v).toFixed(2);
    case "position":
      return `#${Number(v).toFixed(1)}`;
    case "duration": {
      const s = Math.round(v);
      return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
    }
    default:
      return fmtInt(v);
  }
}

/** KPI tile with change vs the previous period. `lowerIsBetter` flips the colour (search position). */
export function KpiTile({ label, kpi, format = "int", lowerIsBetter, hint }: { label: string; kpi: Kpi<any>; format?: KpiFormat; lowerIsBetter?: boolean; hint?: string }) {
  const rate = format === "pct" || format === "position";
  const diff = kpi.previous == null || kpi.value == null ? null : rate ? Number(kpi.value) - Number(kpi.previous) : kpi.change_pct;
  const good = diff == null || diff === 0 ? null : lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff == null || diff === 0 ? Minus : diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm" title={hint}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{fmtValue(kpi.value, format)}</p>
      {diff == null ? (
        <p className="mt-1 text-xs text-muted-foreground">No previous data</p>
      ) : (
        <p className={cn("mt-1 inline-flex items-center gap-0.5 text-xs", good == null ? "text-muted-foreground" : good ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {diff > 0 ? "+" : ""}
          {diff.toFixed(1)}
          {format === "pct" ? " pts" : format === "position" ? " places" : "%"}
          <span className="ml-1 text-muted-foreground">vs previous</span>
        </p>
      )}
    </div>
  );
}

export interface Column<T> {
  key: string;
  label: string;
  numeric?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, empty = "Nothing to show for this period.", maxHeight = "max-h-96" }: { columns: Column<T>[]; rows: T[]; empty?: string; maxHeight?: string }) {
  if (!rows.length) return <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>;
  return (
    <div className={cn("overflow-auto rounded-md border", maxHeight)}>
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("h-8 whitespace-nowrap text-xs", c.numeric && "text-right")}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={c.key} className={cn("py-1.5 text-xs", c.numeric && "text-right tabular-nums", c.className)}>
                  {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Plain card for tables and lists (charts use marketing/ChartCard). */
export function Panel({ title, description, children, className, actions }: { title: string; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 shadow-sm sm:p-5", className)}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

/** Inline bar for a share/percentage inside a table cell. */
export function ShareBar({ value, max = 100, color = "var(--viz-1)" }: { value: number | null; max?: number; color?: string }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="viz-root inline-flex w-full items-center justify-end gap-2">
      <span className="tabular-nums">{value.toFixed(1)}%</span>
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:inline-block" aria-hidden>
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, backgroundColor: color }} />
      </span>
    </span>
  );
}

/** Loading / not connected / error states shared by the three source tabs. */
export function SourceGate<T>({ name, result, loading, children }: { name: string; result?: SourceResult<T>; loading: boolean; children: (data: T) => ReactNode }) {
  if (loading && !result) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }
  if (!result) return null;
  if (!result.configured || result.error) {
    return (
      <Alert variant={result.error ? "destructive" : "default"}>
        {result.error ? <AlertTriangle className="h-4 w-4" /> : <PlugZap className="h-4 w-4" />}
        <AlertTitle>{result.error ? `${name} returned an error` : `Connect ${name}`}</AlertTitle>
        <AlertDescription>
          {result.error && <p className="mb-2 font-mono text-xs">{result.error}</p>}
          <p className="mb-1 text-sm">{result.error ? "Check the setup:" : "Set this up on the server once:"}</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {result.setup.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            Then run <code>php artisan marketing:insights-check</code> on the server to test the connection.
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-5">
      {children(result.data as T)}
      {result.fetched_at && (
        <p className="text-xs text-muted-foreground">Fetched {fmtDate(result.fetched_at, true)} · cached for an hour, use Refresh for live numbers.</p>
      )}
    </div>
  );
}

export const shortDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const axisTick = { fontSize: 11, fill: "#6b6a66" };
