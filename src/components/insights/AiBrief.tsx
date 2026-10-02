"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/components/marketing/labels";
import { useMarketingBrief } from "@/hooks/useMarketing";
import type { MarketingBrief } from "@/types/Insights";

/** On-demand AI marketing plan built from the same data (cached 6h on the server). */
export default function AiBrief({ range }: { range: { from: string; to: string } }) {
  const brief = useMarketingBrief();
  const result: MarketingBrief | undefined = (brief.data as any)?.data;
  const b = result?.brief;

  const run = (refresh = false) => brief.mutate({ ...range, refresh });

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-green-600" aria-hidden /> AI marketing brief
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A prioritised plan, content ideas and a weekly schedule written from this period&apos;s data.
          </p>
        </div>
        {b ? (
          <Button size="sm" variant="outline" onClick={() => run(true)} disabled={brief.isPending}>
            {brief.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Regenerate
          </Button>
        ) : (
          <Button size="sm" onClick={() => run()} disabled={brief.isPending} className="bg-green-600 hover:bg-green-700">
            {brief.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {brief.isPending ? "Writing… (up to a minute)" : "Generate brief"}
          </Button>
        )}
      </header>

      {result && !result.available && <p className="mt-3 text-sm text-muted-foreground">{result.reason}</p>}

      {b && (
        <div className="mt-4 space-y-5">
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200">{b.headline}</p>
            <p className="mt-1 text-sm text-green-900/80 dark:text-green-200/80">{b.situation}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priorities</h3>
            <ol className="space-y-3">
              {b.priorities.map((p, i) => (
                <li key={i} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{i + 1}. {p.title}</span>
                    <Badge variant="outline" className="text-[11px] capitalize">{p.channel}</Badge>
                    <Badge variant="outline" className="text-[11px]">Impact: {p.impact}</Badge>
                    <Badge variant="outline" className="text-[11px]">Effort: {p.effort}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.why}</p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-foreground">
                    {p.actions.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content ideas</h3>
              <ul className="space-y-2">
                {b.content_ideas.map((c, i) => (
                  <li key={i} className="rounded-lg border p-2.5">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.format} · {c.channel} — {c.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">This week</h3>
                <ul className="divide-y rounded-lg border">
                  {b.weekly_plan.map((d, i) => (
                    <li key={i} className="flex gap-3 px-3 py-2 text-sm">
                      <span className="w-20 shrink-0 font-medium text-foreground">{d.day}</span>
                      <span className="text-muted-foreground">{d.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Watch next week</h3>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-foreground">
                  {b.watch_metrics.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Generated {fmtDate(result?.generated_at, true)} by {result?.model}. AI can be wrong — check numbers against the tabs.
          </p>
        </div>
      )}
    </section>
  );
}
