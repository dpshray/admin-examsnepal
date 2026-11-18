"use client";

import { fmtInt } from "@/components/marketing/labels";
import type { QueryRow, SearchData, TopicRow } from "@/types/Insights";
import { RankBars, TrendChart } from "./charts";
import { type Column, DataTable, KpiTile, Panel, ShareBar } from "./shared";

const queryCol: Column<QueryRow> = { key: "query", label: "Search query", className: "min-w-[9rem] whitespace-normal break-words" };
const pos = (r: { position: number | null }) => (r.position == null ? "—" : r.position.toFixed(1));
const signed = (n: number) => (n > 0 ? `+${fmtInt(n)}` : fmtInt(n));

const pagePath = (url: string) => {
  try {
    return decodeURI(new URL(url).pathname) || "/";
  } catch {
    return url;
  }
};

export default function SearchPanel({ data }: { data: SearchData }) {
  const topics = data.topics.filter((t) => t.key !== "other");

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile label="Clicks from Google" kpi={data.kpis.clicks} />
        <KpiTile label="Impressions" kpi={data.kpis.impressions} hint="Times ExamsNepal appeared in Google results" />
        <KpiTile label="Click-through rate" kpi={data.kpis.ctr} format="pct" />
        <KpiTile label="Average position" kpi={data.kpis.position} format="position" lowerIsBetter hint="Lower is better; 1–10 is page one" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart
            title="Daily clicks from Google"
            description="Search Console data for the last 2–3 days is still filling in."
            data={data.series}
            series={[{ key: "clicks", name: "Clicks", color: "var(--viz-1)" }]}
          />
        </div>
        <Panel title="Brand vs discovery" description="Brand = people who searched for ExamsNepal by name">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Brand clicks</dt><dd className="font-medium tabular-nums">{fmtInt(data.brand.brand_clicks)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Non-brand (new students finding you)</dt><dd className="font-medium tabular-nums">{fmtInt(data.brand.non_brand_clicks)}</dd></div>
            <div><dt className="mb-1 text-muted-foreground">Brand share of clicks</dt><dd><ShareBar value={data.brand.brand_share} /></dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Google hides rare queries; the query tables cover {data.brand.visible_click_share.toFixed(0)}% of clicks.
          </p>
        </Panel>
      </div>

      <Panel
        title="Market demand by exam"
        description="What students search on Google, grouped by exam, compared with how many registered students we have for that exam. A big gap between search share and student share = students find you but don't sign up."
      >
        <DataTable<TopicRow>
          rows={topics}
          empty="No queries matched an exam topic yet."
          columns={[
            { key: "label", label: "Exam" },
            { key: "impressions", label: "Impressions", numeric: true, render: (r) => fmtInt(r.impressions) },
            { key: "clicks", label: "Clicks", numeric: true, render: (r) => fmtInt(r.clicks) },
            { key: "change", label: "Clicks vs prev.", numeric: true, render: (r) => (r.click_change_pct == null ? "new" : `${r.click_change_pct > 0 ? "+" : ""}${r.click_change_pct}%`) },
            { key: "position", label: "Avg position", numeric: true, render: pos },
            { key: "search_share", label: "Search share", numeric: true, render: (r) => <ShareBar value={r.search_share} /> },
            { key: "student_share", label: "Student share", numeric: true, render: (r) => <ShareBar value={r.student_share} color="var(--viz-2)" /> },
          ]}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Almost on page 1" description="Position 8–20 with real demand. Improving these pages is the fastest SEO win.">
          <DataTable<QueryRow>
            rows={data.striking_distance}
            empty="No queries in striking distance."
            columns={[
              queryCol,
              { key: "impressions", label: "Impr.", numeric: true, render: (r) => fmtInt(r.impressions) },
              { key: "position", label: "Pos.", numeric: true, render: pos },
              { key: "potential", label: "Extra clicks at #3", numeric: true, render: (r) => `+${fmtInt(r.potential_clicks)}` },
            ]}
          />
        </Panel>
        <Panel title="Ranks well, few clicks" description="Page-one queries with under half the normal click rate — rewrite the title and description.">
          <DataTable<QueryRow>
            rows={data.low_ctr}
            empty="No under-performing titles found."
            columns={[
              queryCol,
              { key: "position", label: "Pos.", numeric: true, render: pos },
              { key: "ctr", label: "CTR", numeric: true, render: (r) => `${r.ctr}%` },
              { key: "expected", label: "Normal CTR", numeric: true, render: (r) => `${r.expected_ctr}%` },
              { key: "potential", label: "Missed clicks", numeric: true, render: (r) => `+${fmtInt(r.potential_clicks)}` },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Rising searches" description="Biggest click gains vs the previous period">
          <DataTable<QueryRow> rows={data.rising} maxHeight="max-h-72" columns={[queryCol, { key: "c", label: "Clicks", numeric: true, render: (r) => signed(r.click_change) }]} />
        </Panel>
        <Panel title="New searches" description="Showed up this period with no clicks before">
          <DataTable<QueryRow> rows={data.new_queries} maxHeight="max-h-72" columns={[queryCol, { key: "i", label: "Impr.", numeric: true, render: (r) => fmtInt(r.impressions) }, { key: "p", label: "Pos.", numeric: true, render: pos }]} />
        </Panel>
        <Panel title="Declining searches" description="Biggest click losses — check rank or season">
          <DataTable rows={data.declining} maxHeight="max-h-72" columns={[
            { key: "query", label: "Search query", className: "min-w-[8rem] whitespace-normal break-words" },
            { key: "c", label: "Clicks", numeric: true, render: (r) => signed(r.click_change) },
            { key: "p", label: "Pos.", numeric: true, render: (r) => (r.position == null ? "gone" : `${r.previous_position?.toFixed(1) ?? "—"} → ${r.position.toFixed(1)}`) },
          ]} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RankBars
          title="What students are looking for"
          description="Search intent by impressions — use this language in posts and page titles"
          valueLabel="Impressions"
          rows={data.intents.filter((i) => i.key !== "other").map((i) => ({ label: i.label, value: i.impressions, note: `${i.queries} queries · ${i.ctr}% CTR` }))}
        />
        <Panel title="Top search queries">
          <DataTable<QueryRow>
            rows={data.top_queries}
            maxHeight="max-h-80"
            columns={[
              queryCol,
              { key: "clicks", label: "Clicks", numeric: true, render: (r) => fmtInt(r.clicks) },
              { key: "impressions", label: "Impr.", numeric: true, render: (r) => fmtInt(r.impressions) },
              { key: "ctr", label: "CTR", numeric: true, render: (r) => `${r.ctr}%` },
              { key: "position", label: "Pos.", numeric: true, render: pos },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Top pages in Google" className="lg:col-span-2">
          <DataTable
            rows={data.pages}
            maxHeight="max-h-80"
            columns={[
              { key: "page", label: "Page", className: "max-w-[320px] truncate", render: (r) => <a href={r.page} target="_blank" rel="noreferrer" className="hover:underline">{pagePath(r.page)}</a> },
              { key: "clicks", label: "Clicks", numeric: true, render: (r) => fmtInt(r.clicks) },
              { key: "impressions", label: "Impr.", numeric: true, render: (r) => fmtInt(r.impressions) },
              { key: "ctr", label: "CTR", numeric: true, render: (r) => `${r.ctr}%` },
              { key: "position", label: "Pos.", numeric: true, render: pos },
            ]}
          />
        </Panel>
        <Panel title="Devices & countries">
          <DataTable
            rows={data.devices}
            columns={[
              { key: "device", label: "Device", className: "capitalize" },
              { key: "clicks", label: "Clicks", numeric: true, render: (r) => fmtInt(r.clicks) },
              { key: "position", label: "Pos.", numeric: true, render: pos },
            ]}
          />
          <div className="mt-3" />
          <DataTable
            rows={data.countries}
            maxHeight="max-h-56"
            columns={[
              { key: "country", label: "Country" },
              { key: "clicks", label: "Clicks", numeric: true, render: (r) => fmtInt(r.clicks) },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
