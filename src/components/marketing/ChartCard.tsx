"use client";

import { type ReactNode, useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TableView {
  columns: string[];
  rows: (string | number)[][];
}

/**
 * Card wrapper for every marketing chart. Some series colours sit below 3:1
 * contrast on white, so each chart also offers the same numbers as a table.
 */
export default function ChartCard({
  title,
  description,
  table,
  actions,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  table?: TableView;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);

  return (
    <section className={cn("viz-root rounded-xl border bg-card p-4 shadow-sm sm:p-5", className)}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          {table && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
            >
              {asTable ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
              {asTable ? "Chart" : "Table"}
            </Button>
          )}
        </div>
      </header>
      {asTable && table ? (
        <div className="max-h-80 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {table.columns.map((c, i) => (
                  <TableHead key={c} className={cn("h-8 text-xs", i > 0 && "text-right")}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row, r) => (
                <TableRow key={r}>
                  {row.map((cell, i) => (
                    <TableCell key={i} className={cn("py-1.5 text-xs", i > 0 && "text-right tabular-nums")}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/** Legend chip: coloured mark + text in text ink (never the series colour). */
export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} aria-hidden />
      {label}
    </span>
  );
}
