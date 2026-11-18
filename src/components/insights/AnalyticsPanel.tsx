"use client";

import { fmtInt } from "@/components/marketing/labels";
import { cn } from "@/lib/utils";
import type { AnalyticsData, ChannelRow } from "@/types/Insights";
import { ActivityHeatmap, RankBars, TrendChart } from "./charts";
import { DataTable, KpiTile, Panel, ShareBar } from "./shared";

const engagementCell = (rate: number, avg: number | null) => (
  <span className={cn(avg != null && rate < avg * 0.7 && "font-medium text-red-700 dark:text-red-400")}>{rate}%</span>
);

export default function AnalyticsPanel({ data }: { data: AnalyticsData }) {
  const avg = data.kpis.engagement_rate.value as number | null;
  const maxShare = Math.max(1, ...data.channels.map((c) => c.share));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile label="Active users" kpi={data.kpis.active_users} />
        <KpiTile label="New users" kpi={data.kpis.new_users} />
        <KpiTile label="Sessions" kpi={data.kpis.sessions} />
        <KpiTile label="Engagement rate" kpi={data.kpis.engagement_rate} format="pct" hint="Sessions longer than 10s, with 2+ pages or a key event" />
        <KpiTile label="Avg session" kpi={data.kpis.avg_session_seconds} format="duration" />
        <KpiTile label="Page views" kpi={data.kpis.page_views} />
        <KpiTile label="Key events" kpi={data.kpis.key_events} hint="Conversions marked as key events in GA4 (sign-up, purchase…)" />
      </div>

      <TrendChart
        title="Daily website visitors"
        data={data.series}
        series={[
          { key: "active_users", name: "Active users", color: "var(--viz-1)" },
          { key: "new_users", name: "New users", color: "var(--viz-2)" },
        ]}
      />

      <Panel title="Where visitors come from" description="Default channel groups. Red engagement = well below the site average; those visitors leave quickly.">
        <DataTable<ChannelRow>
          rows={data.channels}
          columns={[
            { key: "channel", label: "Channel" },
            { key: "sessions", label: "Sessions", numeric: true, render: (r) => fmtInt(r.sessions) },
            { key: "change", label: "vs prev.", numeric: true, render: (r) => (r.change_pct == null ? "new" : `${r.change_pct > 0 ? "+" : ""}${r.change_pct}%`) },
            { key: "share", label: "Share", numeric: true, render: (r) => <ShareBar value={r.share} max={maxShare} /> },
            { key: "new_users", label: "New users", numeric: true, render: (r) => fmtInt(r.new_users) },
            { key: "engagement", label: "Engaged", numeric: true, render: (r) => engagementCell(r.engagement_rate, avg) },
            { key: "key_events", label: "Key events", numeric: true, render: (r) => fmtInt(r.key_events) },
            { key: "rate", label: "Conv. rate", numeric: true, render: (r) => `${r.key_event_rate}%` },
          ]}
        />
      </Panel>

      <ActivityHeatmap
        grid={data.heatmap}
        title="When students are online"
        description="Active users by weekday and hour (GA4 property time zone). Post on Facebook and send emails just before the darkest blocks."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Landing pages" description="First page of each visit">
          <DataTable
            rows={data.landing_pages}
            maxHeight="max-h-96"
            columns={[
              { key: "page", label: "Page", className: "min-w-[10rem] whitespace-normal break-all" },
              { key: "sessions", label: "Sessions", numeric: true, render: (r) => fmtInt(r.sessions) },
              { key: "engagement", label: "Engaged", numeric: true, render: (r) => engagementCell(r.engagement_rate, avg) },
              { key: "key_events", label: "Key events", numeric: true, render: (r) => fmtInt(r.key_events) },
            ]}
          />
        </Panel>
        <Panel title="Sources" description="Exact source / medium (UTM-tagged links show here)">
          <DataTable
            rows={data.sources}
            maxHeight="max-h-96"
            columns={[
              { key: "source", label: "Source / medium", className: "min-w-[10rem] whitespace-normal break-all" },
              { key: "sessions", label: "Sessions", numeric: true, render: (r) => fmtInt(r.sessions) },
              { key: "engagement", label: "Engaged", numeric: true, render: (r) => engagementCell(r.engagement_rate, avg) },
              { key: "key_events", label: "Key events", numeric: true, render: (r) => fmtInt(r.key_events) },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <RankBars
          title="Top cities"
          description="Use for ad geo-targeting and campus partnerships"
          valueLabel="Active users"
          rows={data.cities.filter((c) => c.city !== "(not set)").slice(0, 10).map((c) => ({ label: c.city, value: c.active_users }))}
        />
        <Panel title="Devices & countries">
          <DataTable
            rows={data.devices}
            columns={[
              { key: "device", label: "Device", className: "capitalize" },
              { key: "active_users", label: "Users", numeric: true, render: (r) => fmtInt(r.active_users) },
              { key: "engagement", label: "Engaged", numeric: true, render: (r) => `${r.engagement_rate}%` },
            ]}
          />
          <div className="mt-3" />
          <DataTable
            rows={data.countries}
            maxHeight="max-h-56"
            columns={[
              { key: "country", label: "Country" },
              { key: "active_users", label: "Users", numeric: true, render: (r) => fmtInt(r.active_users) },
            ]}
          />
        </Panel>
        <Panel title="Events" description="★ = marked as key event in GA4">
          <DataTable
            rows={data.events}
            maxHeight="max-h-96"
            columns={[
              { key: "event", label: "Event", render: (r) => `${r.event}${r.is_key_event ? " ★" : ""}` },
              { key: "count", label: "Count", numeric: true, render: (r) => fmtInt(r.count) },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
