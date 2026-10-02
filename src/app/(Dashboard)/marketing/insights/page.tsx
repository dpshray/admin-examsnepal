"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Globe, Loader2, RefreshCw, XCircle } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketingFilterBar, { presetRange } from "@/components/marketing/MarketingFilterBar";
import { fmtInt } from "@/components/marketing/labels";
import InsightFeed from "@/components/insights/InsightFeed";
import AiBrief from "@/components/insights/AiBrief";
import SearchPanel from "@/components/insights/SearchPanel";
import AnalyticsPanel from "@/components/insights/AnalyticsPanel";
import FacebookPanel from "@/components/insights/FacebookPanel";
import { Panel, SourceGate } from "@/components/insights/shared";
import { useInsightSource, useInsightsSummary, useRefreshInsights } from "@/hooks/useMarketing";
import type { AnalyticsData, FacebookData, InsightsSummary, SearchData, SourceResult } from "@/types/Insights";

const SOURCE_NAMES = { search: "Google Search Console", analytics: "Google Analytics 4", facebook: "Facebook Page" } as const;

function SourceStatus({ name, result, loading }: { name: string; result?: SourceResult<unknown>; loading: boolean }) {
  const [Icon, tone, text] = loading && !result
    ? [Loader2, "text-muted-foreground animate-spin", "Loading…"]
    : !result?.configured
      ? [CircleDashed, "text-muted-foreground", "Not connected"]
      : result.error
        ? [XCircle, "text-red-600", "Error"]
        : [CheckCircle2, "text-green-600", "Connected"];
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 shrink-0 ${tone}`} aria-hidden />
      <span className="flex-1 text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}

export default function WebSocialInsightsPage() {
  const [range, setRange] = useState(() => presetRange(30));

  const search = useInsightSource("search", range);
  const analytics = useInsightSource("analytics", range);
  const facebook = useInsightSource("facebook", range);
  const refresh = useRefreshInsights(range);

  const results = {
    search: (search.data as any)?.data as SourceResult<SearchData> | undefined,
    analytics: (analytics.data as any)?.data as SourceResult<AnalyticsData> | undefined,
    facebook: (facebook.data as any)?.data as SourceResult<FacebookData> | undefined,
  };
  const settled = !search.isFetching && !analytics.isFetching && !facebook.isFetching;
  const version = useMemo(
    () => [results.search, results.analytics, results.facebook].map((r) => r?.fetched_at ?? "-").join("|"),
    [results.search, results.analytics, results.facebook],
  );
  const summaryQuery = useInsightsSummary(range, version, settled);
  const summary = (summaryQuery.data as any)?.data as InsightsSummary | undefined;
  const noneConnected = settled && Object.values(results).every((r) => r && !r.configured);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Globe}
        title="Web & social insights"
        description="Google Search, website analytics and Facebook in one place — with what to do next."
      />

      <MarketingFilterBar from={range.from} to={range.to} onRangeChange={setRange}>
        <Button size="sm" variant="outline" className="h-8 sm:ml-auto" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
          {refresh.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
        </Button>
      </MarketingFilterBar>

      <Tabs defaultValue="plan" className="space-y-5">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="plan">Action plan</TabsTrigger>
          <TabsTrigger value="search">Google Search</TabsTrigger>
          <TabsTrigger value="analytics">Website</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {noneConnected ? (
                <Panel title="Connect your data sources" description="Nothing is connected yet. Open each tab for step-by-step setup.">
                  <p className="text-sm text-muted-foreground">
                    Once Search Console, GA4 and your Facebook Page are connected, this page lists what is working, what to fix and
                    where the opportunities are — e.g. searches that are almost on page one, exams with search demand but few
                    sign-ups, the best time and format to post on Facebook.
                  </p>
                </Panel>
              ) : (
                <InsightFeed items={summary?.insights ?? []} />
              )}
            </div>
            <div className="space-y-5">
              <Panel title="Sources">
                <div className="space-y-2.5">
                  <SourceStatus name={SOURCE_NAMES.search} result={results.search} loading={search.isLoading} />
                  <SourceStatus name={SOURCE_NAMES.analytics} result={results.analytics} loading={analytics.isLoading} />
                  <SourceStatus name={SOURCE_NAMES.facebook} result={results.facebook} loading={facebook.isLoading} />
                </div>
              </Panel>
              <Panel title="Sign-ups by source" description="New registrations in this period, from UTM / signup source">
                {summary?.signup_sources.length ? (
                  <ul className="space-y-1.5 text-sm">
                    {summary.signup_sources.map((s) => (
                      <li key={s.source} className="flex justify-between">
                        <span className="text-muted-foreground">{s.source}</span>
                        <span className="font-medium tabular-nums">{fmtInt(s.students)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No sign-ups with a known date in this period.</p>
                )}
              </Panel>
            </div>
          </div>
          <AiBrief range={range} />
        </TabsContent>

        <TabsContent value="search">
          <SourceGate name={SOURCE_NAMES.search} result={results.search} loading={search.isLoading}>
            {(d) => <SearchPanel data={d} />}
          </SourceGate>
        </TabsContent>
        <TabsContent value="analytics">
          <SourceGate name={SOURCE_NAMES.analytics} result={results.analytics} loading={analytics.isLoading}>
            {(d) => <AnalyticsPanel data={d} />}
          </SourceGate>
        </TabsContent>
        <TabsContent value="facebook">
          <SourceGate name={SOURCE_NAMES.facebook} result={results.facebook} loading={facebook.isLoading}>
            {(d) => <FacebookPanel data={d} />}
          </SourceGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
