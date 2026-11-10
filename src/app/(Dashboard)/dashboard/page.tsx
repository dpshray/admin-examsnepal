"use client";

import { useState, type ElementType, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Radar,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamMixChart, GrowthChart } from "@/components/marketing/ActivityCharts";
import { Tile } from "@/components/marketing/KpiGrid";
import { presetRange } from "@/components/marketing/MarketingFilterBar";
import { fmtInt, fmtNpr } from "@/components/marketing/labels";
import { QUERY_STALE_TIME } from "@/config/app-constant";
import { useMarketingOverview } from "@/hooks/useMarketing";
import { dashboardService, type DashboardSummary } from "@/service/dashboard.service";
import type { Kpi, MarketingKpis, MarketingOverview } from "@/types/Marketing";

/** Combines the per-type attempt KPIs into one "exams taken" figure. */
function examsTaken(kpis: MarketingKpis): Kpi<number> {
  const parts = [kpis.attempts_free, kpis.attempts_sprint, kpis.attempts_mock, kpis.attempts_topic];
  const value = parts.reduce((sum, k) => sum + (k.value ?? 0), 0);
  const previous = parts.reduce((sum, k) => sum + (k.previous ?? 0), 0);
  return { value, previous, change_pct: previous ? ((value - previous) / previous) * 100 : null };
}

function QueueCard({
  href,
  icon: Icon,
  label,
  count,
  detail,
}: {
  href: string;
  icon: ElementType;
  label: string;
  count: number;
  detail?: string;
}) {
  const clear = count === 0;
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="mt-0.5 rounded-md bg-muted p-2 text-gray-600">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="mt-1 block text-2xl font-semibold tabular-nums text-gray-900">{fmtInt(count)}</span>
        <span className={`mt-1 inline-flex items-center gap-1 text-xs ${clear ? "text-green-700" : "text-amber-700"}`}>
          {clear ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
          {clear ? "All clear" : detail ?? "Needs review"}
        </span>
      </span>
    </Link>
  );
}

function TotalTile({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{fmtInt(value)}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function SkeletonGrid({ count, className }: { count: number; className: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-900">{children}</h2>;
}

export default function DashboardPage() {
  const [range] = useState(() => presetRange(30));

  const summaryQuery = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: () => dashboardService.getSummary(),
    staleTime: QUERY_STALE_TIME,
  });
  const overview = useMarketingOverview(range);

  const summary: DashboardSummary | undefined = summaryQuery.data?.data;
  const trends: MarketingOverview | undefined = overview.data?.data;
  const queues = summary?.queues;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="What needs attention today and how the platform is doing."
      />

      {summaryQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription>{(summaryQuery.error as any)?.message || "Failed to load the dashboard summary."}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-3" aria-label="Needs attention">
        <SectionTitle>Needs attention</SectionTitle>
        {!queues ? (
          !summaryQuery.isError && <SkeletonGrid count={5} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QueueCard href="/doubts" icon={HelpCircle} label="Unresolved doubts" count={queues.open_doubts} />
            <QueueCard href="/notices" icon={Megaphone} label="Notices awaiting review" count={queues.pending_notices + queues.notice_reports} detail={queues.notice_reports ? `Includes ${fmtInt(queues.notice_reports)} reported` : undefined} />
            <QueueCard href="/forum-reports" icon={Flag} label="Forum reports" count={queues.forum_reports} />
            <QueueCard href="/payouts" icon={Wallet} label="Pending teacher payouts" count={queues.pending_payouts} detail={fmtNpr(queues.pending_payouts_amount)} />
            <QueueCard href="/notice-fetch-logs" icon={Radar} label="Failed fetches · 24 hours" count={queues.failed_fetches_24h} detail="Check the fetch logs" />
          </div>
        )}
      </section>

      <section className="space-y-3" aria-label="Platform totals">
        <SectionTitle>Platform totals</SectionTitle>
        {!summary ? (
          !summaryQuery.isError && <SkeletonGrid count={4} className="grid grid-cols-2 gap-3 md:grid-cols-4" />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <TotalTile label="Students" value={summary.totals.students} />
            <TotalTile
              label="Active subscribers"
              value={summary.totals.active_subscribers}
              detail={summary.totals.expiring_soon ? `${fmtInt(summary.totals.expiring_soon)} ending within 7 days` : undefined}
            />
            <TotalTile label="Active exams" value={summary.totals.active_exams} />
            <TotalTile label="Questions" value={summary.totals.questions} />
          </div>
        )}
      </section>

      <section className="space-y-3" aria-label="Last 30 days">
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle>Last 30 days</SectionTitle>
          <Link href="/marketing" className="text-xs font-medium text-blue-700 hover:underline">
            Full marketing report
          </Link>
        </div>

        {overview.isError && (
          <Alert variant="destructive">
            <AlertDescription>{(overview.error as any)?.message || "Failed to load the 30-day trends."}</AlertDescription>
          </Alert>
        )}

        {!trends ? (
          !overview.isError && <SkeletonGrid count={5} className="grid grid-cols-2 gap-3 md:grid-cols-5" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Tile label="New registrations" kpi={trends.kpis.new_registrations} />
              <Tile label="Active students · 7 days" kpi={trends.kpis.active_students_7d} hint="Took at least one exam in the last 7 days" />
              <Tile label="Exams taken" kpi={examsTaken(trends.kpis)} />
              <Tile label="New paid subscriptions" kpi={trends.kpis.new_paid_subscriptions} />
              <Tile label="Revenue" kpi={trends.kpis.revenue_npr} format="npr" hint="Includes subscriptions added manually by admins (offline payments)" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <GrowthChart series={trends.daily.series} granularity={trends.daily.granularity} />
              <ExamMixChart series={trends.daily.series} granularity={trends.daily.granularity} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
