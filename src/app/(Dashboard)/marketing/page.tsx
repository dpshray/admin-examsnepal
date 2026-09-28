"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import MarketingFilterBar, { presetRange } from "@/components/marketing/MarketingFilterBar";
import KpiGrid from "@/components/marketing/KpiGrid";
import FunnelChart from "@/components/marketing/FunnelChart";
import { ExamMixChart, GrowthChart } from "@/components/marketing/ActivityCharts";
import StageDistribution from "@/components/marketing/StageDistribution";
import CohortGrid from "@/components/marketing/CohortGrid";
import TopExams from "@/components/marketing/TopExams";
import { fmtDate, fmtInt } from "@/components/marketing/labels";
import { useMarketingCohorts, useMarketingMeta, useMarketingOverview } from "@/hooks/useMarketing";
import type { CohortRow, MarketingOverview } from "@/types/Marketing";

export default function MarketingOverviewPage() {
  const [range, setRange] = useState(() => presetRange(30));
  const [examTypeId, setExamTypeId] = useState("");
  const [weeks, setWeeks] = useState(8);

  const meta = useMarketingMeta();
  const overview = useMarketingOverview({ ...range, exam_type_id: examTypeId });
  const cohorts = useMarketingCohorts({ weeks, exam_type_id: examTypeId });

  const data: MarketingOverview | undefined = overview.data?.data;
  const cohortRows: CohortRow[] = cohorts.data?.data?.rows ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={TrendingUp}
        title="Marketing overview"
        description="Registrations, activation, exam habits and paid conversion across the funnel."
      />

      <MarketingFilterBar
        from={range.from}
        to={range.to}
        examTypeId={examTypeId}
        examTypes={meta.data?.data?.exam_types ?? []}
        onRangeChange={setRange}
        onExamTypeChange={setExamTypeId}
      />

      {overview.isError && (
        <Alert variant="destructive">
          <AlertDescription>{(overview.error as any)?.message || "Failed to load marketing data."}</AlertDescription>
        </Alert>
      )}

      {!data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className={`space-y-5 transition-opacity ${overview.isFetching ? "opacity-70" : ""}`}>
          <KpiGrid kpis={data.kpis} />

          <div className="grid gap-5 lg:grid-cols-2">
            <FunnelChart steps={data.funnel} />
            <StageDistribution stages={data.stage_distribution} examTypeId={examTypeId} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <GrowthChart series={data.daily.series} granularity={data.daily.granularity} />
            <ExamMixChart series={data.daily.series} granularity={data.daily.granularity} />
          </div>

          <CohortGrid rows={cohortRows} weeks={weeks} onWeeksChange={setWeeks} loading={cohorts.isFetching} />

          <TopExams byAttempts={data.top_exams.by_attempts} byConversion={data.top_exams.by_conversion} />

          <p className="text-xs text-muted-foreground">
            Student metrics last rebuilt {fmtDate(data.metrics_updated_at, true)} (hourly).
            {data.unknown_signup_students > 0 &&
              ` ${fmtInt(data.unknown_signup_students)} legacy students have no known signup date and are left out of registration, funnel and cohort figures.`}
          </p>
        </div>
      )}
    </div>
  );
}
