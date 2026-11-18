"use client";

import { ExternalLink, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { fmtDate, fmtInt } from "@/components/marketing/labels";
import type { FacebookData, FbGroupRow, FbPost } from "@/types/Insights";
import { RankBars, TrendChart } from "./charts";
import { DataTable, KpiTile, Panel } from "./shared";

const groupBars = (rows: FbGroupRow[]) =>
  rows.map((r) => ({ label: r.label, value: r.avg_engagement, note: `${r.posts} post${r.posts === 1 ? "" : "s"} · ${r.avg_comments} comments avg` }));
const oneDecimal = (v: number) => v.toFixed(1);

function PostList({ posts }: { posts: FbPost[] }) {
  if (!posts.length) return <p className="py-6 text-center text-xs text-muted-foreground">No posts in this period.</p>;
  return (
    <ul className="divide-y">
      {posts.map((p) => (
        <li key={p.id} className="flex gap-3 py-3">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" loading="lazy" />
          ) : (
            <span className="h-16 w-16 shrink-0 rounded-md bg-muted" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-foreground">{p.message || <span className="italic text-muted-foreground">(no text)</span>}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{fmtDate(p.created_at, true)}</span>
              <span className="capitalize">{p.format}</span>
              <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" aria-hidden />{fmtInt(p.reactions)}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" aria-hidden />{fmtInt(p.comments)}</span>
              <span className="inline-flex items-center gap-1"><Share2 className="h-3 w-3" aria-hidden />{fmtInt(p.shares)}</span>
              {p.permalink && (
                <a href={p.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                  Open <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FacebookPanel({ data }: { data: FacebookData }) {
  const metrics = Object.entries(data.page_insights);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        {data.page.picture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.page.picture} alt="" className="h-10 w-10 rounded-full" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{data.page.name}</p>
          <p className="text-xs text-muted-foreground">
            {fmtInt(data.page.followers)} followers · {data.posts_per_week} posts/week
            {data.longest_gap_days != null && ` · longest gap ${data.longest_gap_days} days`}
          </p>
        </div>
        {data.page.link && (
          <a href={data.page.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Open page <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiTile label="Posts" kpi={data.kpis.posts} />
        <KpiTile label="Interactions" kpi={data.kpis.engagement} hint="Reactions + comments + shares" />
        <KpiTile label="Per post" kpi={data.kpis.avg_engagement} />
        <KpiTile label="Comments" kpi={data.kpis.comments} />
        <KpiTile label="Shares" kpi={data.kpis.shares} />
        <KpiTile label="Per post per 1k followers" kpi={data.kpis.engagement_per_1k} format="dec" hint="Compare pages of any size; above 1 is healthy" />
      </div>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {metrics.map(([key, m]) => (
            <div key={key} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{fmtInt(m.total)}</p>
              {m.since && <p className="mt-1 text-xs text-muted-foreground">since {fmtDate(m.since)}</p>}
            </div>
          ))}
        </div>
      )}

      <TrendChart
        title="Daily interactions on posts"
        description="By the day the post was published"
        data={data.series}
        series={[{ key: "engagement", name: "Interactions", color: "var(--viz-1)" }]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <RankBars title="Which formats work" description="Average interactions per post" valueLabel="Avg interactions" format={oneDecimal} rows={groupBars(data.by_format)} />
        <RankBars title="Which exam topics work" description="Average interactions per post, by exam mentioned" valueLabel="Avg interactions" format={oneDecimal} rows={groupBars(data.by_topic)} />
        <RankBars title="Best days to post" description="Nepal time" valueLabel="Avg interactions" format={oneDecimal} rows={groupBars(data.by_day)} />
        <Panel title="Best hours to post" description="Nepal time; hours with at least one post">
          <DataTable<FbGroupRow>
            rows={[...data.by_hour].sort((a, b) => b.avg_engagement - a.avg_engagement)}
            maxHeight="max-h-72"
            columns={[
              { key: "label", label: "Hour" },
              { key: "posts", label: "Posts", numeric: true },
              { key: "avg", label: "Avg interactions", numeric: true, render: (r) => r.avg_engagement.toFixed(1) },
              { key: "comments", label: "Avg comments", numeric: true, render: (r) => r.avg_comments.toFixed(1) },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Top posts" description="Repeat what worked: same format, topic and hook"><PostList posts={data.top_posts} /></Panel>
        <Panel title="Weakest posts" description="Shown when there are 10+ posts"><PostList posts={data.weakest_posts} /></Panel>
      </div>

      {data.unavailable_metrics.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Page Insights metrics not available from Meta: {data.unavailable_metrics.map((m) => m.metric).join(", ")}. Post-level numbers above are unaffected.
          Edit <code>marketing.insights.facebook.page_metrics</code> if Meta renamed them.
        </p>
      )}
    </>
  );
}
