"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Kpi, MarketingKpis } from "@/types/Marketing";
import { fmtInt, fmtNpr, fmtPct } from "./labels";

type Format = "int" | "pct" | "npr";

function Change({ kpi, format, untracked }: { kpi: Kpi<any>; format: Format; untracked?: boolean }) {
  if (untracked) return <p className="mt-1 text-xs text-muted-foreground">Not tracked yet</p>;
  if (kpi.value == null) return <p className="mt-1 text-xs text-muted-foreground">No data in this period</p>;
  // Rates change in percentage points; counts in percent.
  const diff = format === "pct" && kpi.previous != null ? Number(kpi.value) - Number(kpi.previous) : kpi.change_pct;
  if (diff == null) return <p className="mt-1 text-xs text-muted-foreground">No previous data</p>;
  const up = diff > 0;
  const Icon = diff === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const tone = diff === 0 ? "text-muted-foreground" : up ? "text-green-700" : "text-red-700";
  return (
    <p className={`mt-1 inline-flex items-center gap-0.5 text-xs ${tone}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {up ? "+" : ""}
      {diff.toFixed(1)}
      {format === "pct" ? " pts" : "%"}
      <span className="ml-1 text-muted-foreground">vs previous</span>
    </p>
  );
}

function Tile({ label, kpi, format = "int", hint, untracked }: { label: string; kpi: Kpi<any>; format?: Format; hint?: string; untracked?: boolean }) {
  const value = format === "pct" ? fmtPct(kpi.value) : format === "npr" ? fmtNpr(kpi.value) : fmtInt(kpi.value);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm" title={hint}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
      <Change kpi={kpi} format={format} untracked={untracked} />
    </div>
  );
}

export default function KpiGrid({ kpis }: { kpis: MarketingKpis }) {
  const plans = kpis.revenue_by_plan.value ?? [];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="New registrations" kpi={kpis.new_registrations} />
        <Tile label="Activation rate" kpi={kpis.activation_rate} format="pct" hint="Registered in the period and took a first exam within 7 days" />
        <Tile label="Active students · 7 days" kpi={kpis.active_students_7d} hint="Took at least one exam in the 7 days before the period end" />
        <Tile label="Active students · 30 days" kpi={kpis.active_students_30d} />
        <Tile label="Free exams taken" kpi={kpis.attempts_free} />
        <Tile label="Sprint exams taken" kpi={kpis.attempts_sprint} />
        <Tile label="Mock exams taken" kpi={kpis.attempts_mock} />
        <Tile label="Free → paid conversion" kpi={kpis.free_to_paid_rate} format="pct" hint="First-time payers ÷ unpaid students who took an exam in the period" />
        <Tile label="New paid subscriptions" kpi={kpis.new_paid_subscriptions} />
        <Tile label="Revenue" kpi={kpis.revenue_npr} format="npr" hint="Includes subscriptions added manually by admins (offline payments)" />
        <Tile label="Renewal rate" kpi={kpis.renewal_rate} format="pct" hint="Subscriptions ending in the period followed by another payment" />
        <Tile label="Emails sent" kpi={kpis.emails_sent} />
        <Tile label="Email click rate" kpi={kpis.email_click_rate} format="pct" />
        <Tile label="Email-attributed conversions" kpi={kpis.email_attributed_conversions} hint="Emails whose goal (first exam, mock, payment…) happened within 72 hours" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-gray-600">
        <span className="font-medium text-gray-900">Revenue by plan:</span>
        {plans.length === 0 && <span>No sales in this period</span>}
        {plans.map((p) => (
          <span key={p.months} className="tabular-nums">
            {p.months} month{p.months > 1 ? "s" : ""}: {fmtInt(p.count)} · {fmtNpr(p.revenue_npr)}
          </span>
        ))}
        {!!kpis.manual_subscriptions.value && (
          <span className="text-muted-foreground">
            ({fmtInt(kpis.manual_subscriptions.value)} added manually by admin · {fmtNpr(kpis.manual_revenue_npr.value)})
          </span>
        )}
      </div>
    </div>
  );
}
