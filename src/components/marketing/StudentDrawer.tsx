"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketingMeta, useMarketingStudent } from "@/hooks/useMarketing";
import type { StudentProfileDetail } from "@/types/Marketing";
import {
  EVENT_LABELS, LEAD_REASON_LABELS, STAGE_HINTS, STAGE_LABELS, SUBSCRIPTION_LABELS,
  fmtDate, fmtInt, fmtNpr, fmtPct, relativeDays, segmentLabel,
} from "./labels";

const TYPE_LABEL: Record<string, string> = { free: "Free", sprint: "Sprint", mock: "Mock", topic: "Topic", other: "Other" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

function ScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="max-w-56 rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{fmtPct(p.score_pct)}</p>
      <p className="truncate text-gray-600">{p.exam_name}</p>
      <p className="text-muted-foreground">{TYPE_LABEL[p.type]} · {fmtDate(p.date)}</p>
    </div>
  );
}

function Body({ d }: { d: StudentProfileDetail }) {
  const meta = useMarketingMeta();
  const m = d.metrics;
  const p = d.profile;
  const breakdown = Object.entries(m?.lead_score_breakdown ?? {});

  return (
    <div className="space-y-6">
      {/* Header facts */}
      <div className="flex flex-wrap items-center gap-2">
        {m?.lifecycle_stage && (
          <Badge variant="secondary" title={STAGE_HINTS[m.lifecycle_stage]}>{STAGE_LABELS[m.lifecycle_stage]}</Badge>
        )}
        {m && <Badge variant="outline">{SUBSCRIPTION_LABELS[m.subscription_status]}{m.subscription_ends_at ? ` · ends ${fmtDate(m.subscription_ends_at)}` : ""}</Badge>}
        {!p.marketing_email_opt_in || p.unsubscribed_at ? <Badge variant="destructive">Unsubscribed from marketing</Badge> : null}
        {d.tags.map((t) => <Badge key={t} variant="outline" className="border-dashed">#{t}</Badge>)}
      </div>

      <div className="grid gap-1 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{p.email}</span>
        {p.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{p.phone}</span>}
        <span>
          Target exam: <span className="text-gray-900">{p.target_exam ?? "—"}</span>
          {p.target_exam_date && <> · exam on {fmtDate(p.target_exam_date)}</>}
        </span>
        <span>
          Signed up {fmtDate(p.created_at)} {p.signup_source || p.utm_source ? `via ${[p.signup_source, p.utm_source, p.utm_campaign].filter(Boolean).join(" / ")}` : ""}
          {" · "}last seen {relativeDays(m?.last_seen_at)} {p.last_platform ? `(${p.last_platform})` : ""}
        </span>
      </div>

      {m ? (
        <>
          <Section title={`Lead score · ${m.lead_score}/100`}>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full" style={{ width: `${m.lead_score}%`, backgroundColor: "var(--viz-1)" }} />
            </div>
            {breakdown.length ? (
              <ul className="grid gap-1 text-xs sm:grid-cols-2">
                {breakdown.map(([k, v]) => (
                  <li key={k} className="flex justify-between rounded border px-2 py-1">
                    <span className="text-gray-600">{LEAD_REASON_LABELS[k] ?? k}</span>
                    <span className={`font-medium tabular-nums ${v < 0 ? "text-red-700" : "text-gray-900"}`}>{v > 0 ? `+${v}` : v}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No scoring signals yet.</p>
            )}
          </Section>

          <Section title="Activity">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Exams (all)" value={fmtInt(m.total_attempts)} />
              <Stat label="Free / Sprint / Mock" value={`${m.free_attempts} / ${m.sprint_attempts} / ${m.mock_attempts}`} />
              <Stat label="Last 7 / 30 days" value={`${m.attempts_last_7d} / ${m.attempts_last_30d}`} />
              <Stat label="Streak (best)" value={`${m.current_streak_days} (${m.longest_streak_days}) days`} />
              <Stat label="Avg score" value={fmtPct(m.avg_score_pct)} />
              <Stat label="Best / last" value={`${fmtPct(m.best_score_pct, 0)} / ${fmtPct(m.last_score_pct, 0)}`} />
              <Stat label="Percentile in exam" value={m.percentile_in_exam == null ? "—" : `${Math.round(Number(m.percentile_in_exam))}th`} />
              <Stat label="Paid total" value={fmtNpr(m.total_paid_npr)} />
            </div>
            <div className="flex flex-wrap gap-1">
              {m.segments.map((s) => (
                <Badge key={s} variant="outline" className="font-normal">{segmentLabel(s, meta.data?.data?.exam_types)}</Badge>
              ))}
            </div>
          </Section>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Metrics not computed yet — they rebuild hourly.</p>
      )}

      <Section title="Score trend">
        {d.score_series.length >= 2 ? (
          <div className="viz-root h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.score_series} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b6a66" }} tickLine={false} axisLine={false} minTickGap={24}
                  tickFormatter={(v) => new Date(`${v}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b6a66" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ScoreTooltip />} cursor={{ stroke: "#a3a29d", strokeDasharray: "3 3" }} />
                <Line type="monotone" dataKey="score_pct" name="Score %" stroke="var(--viz-1)" strokeWidth={2}
                  dot={{ r: 3, fill: "var(--viz-1)", strokeWidth: 0 }} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Needs at least two dated, scored exams.</p>
        )}
      </Section>

      <Section title="Subjects">
        {d.subjects.length ? (
          <ul className="space-y-1.5 text-xs">
            {d.subjects.map((sub) => (
              <li key={sub.id} className="grid grid-cols-[10rem_1fr_5.5rem] items-center gap-2">
                <span className="truncate text-gray-700" title={sub.name}>
                  {sub.name}
                  {m?.weakest_subject_id === sub.id && <span className="ml-1 text-red-700">(weakest)</span>}
                  {m?.strongest_subject_id === sub.id && <span className="ml-1 text-green-700">(strongest)</span>}
                </span>
                <span className="h-2 rounded-full bg-muted">
                  <span className="block h-2 rounded-full" style={{ width: `${Math.min(100, Number(sub.avg_score_pct))}%`, backgroundColor: "var(--viz-1)" }} />
                </span>
                <span className="text-right tabular-nums">{fmtPct(sub.avg_score_pct, 0)} · {sub.attempts}×</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No single-subject exams taken yet.</p>
        )}
        <p className="text-[11px] text-muted-foreground">From exams tagged with one subject; mixed mocks aren&apos;t counted.</p>
      </Section>

      <Section title={`Exam timeline (${d.attempts.length})`}>
        {d.attempts.length ? (
          <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border text-xs">
            {d.attempts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-14 shrink-0 text-muted-foreground">{TYPE_LABEL[a.type]}</span>
                <span className="min-w-0 flex-1 truncate text-gray-900" title={a.exam_name}>{a.exam_name}</span>
                <span className="w-14 shrink-0 text-right tabular-nums">
                  {a.completed ? fmtPct(a.score_pct, 0) : <span className="text-amber-700">Unfinished</span>}
                </span>
                <span className="w-24 shrink-0 text-right text-muted-foreground">{fmtDate(a.submitted_at ?? a.started_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No exams yet.</p>
        )}
      </Section>

      <Section title={`Messages (${d.messages.length})`}>
        {d.messages.length ? (
          <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border text-xs">
            {d.messages.map((msg) => (
              <li key={msg.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-gray-900" title={msg.subject ?? msg.template_key}>
                  {msg.subject ?? msg.automation ?? msg.template_key}
                </span>
                <span className="text-muted-foreground">{msg.channel}{msg.variant === "B" ? " · B" : ""}</span>
                <span className={msg.status === "suppressed" || msg.status === "failed" || msg.status === "bounced" ? "text-amber-700" : "text-gray-700"}>
                  {msg.status}{msg.suppress_reason ? ` (${msg.suppress_reason.replaceAll("_", " ")})` : ""}
                </span>
                {msg.goal_met_at && <span className="text-green-700">goal met</span>}
                <span className="w-24 text-right text-muted-foreground">{fmtDate(msg.sent_at ?? msg.scheduled_for)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No messages sent to this student yet.</p>
        )}
      </Section>

      <Section title={`Payments (${d.payments.length})`}>
        {d.payments.length ? (
          <ul className="divide-y rounded-lg border text-xs">
            {d.payments.map((pay) => (
              <li key={pay.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2">
                <span className="font-medium text-gray-900">{fmtNpr(pay.paid)}</span>
                <span className="text-gray-600">{pay.months ? `${pay.months} month${pay.months > 1 ? "s" : ""}` : "—"}</span>
                <span className={pay.payment_status === "PAYMENT_SUCCESS" ? "text-green-700" : "text-amber-700"}>
                  {(pay.payment_status ?? "unknown").replace("PAYMENT_", "").toLowerCase()}
                </span>
                {pay.is_manual && <span className="text-muted-foreground">added by admin</span>}
                <span className="ml-auto text-muted-foreground">
                  {fmtDate(pay.subscribed_at)} · {fmtDate(pay.start_date)} → {fmtDate(pay.end_date)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No payments or checkouts.</p>
        )}
      </Section>

      <Section title="Recent events">
        {d.events.length ? (
          <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border text-xs">
            {d.events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-1.5">
                <span className="flex-1 text-gray-900">{EVENT_LABELS[e.name] ?? e.name}</span>
                {e.platform && <span className="text-muted-foreground">{e.platform}</span>}
                <span className="w-32 text-right text-muted-foreground">{fmtDate(e.created_at, true)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No tracked events yet (tracking started with this release).</p>
        )}
      </Section>
    </div>
  );
}

export default function StudentDrawer({ studentId, onClose }: { studentId: number | null; onClose: () => void }) {
  const { data, isLoading, isError } = useMarketingStudent(studentId);
  const detail: StudentProfileDetail | undefined = data?.data;

  return (
    <Sheet open={!!studentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="viz-root w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="pb-0">
          <SheetTitle>{detail?.profile.name ?? "Student"}</SheetTitle>
          <SheetDescription>Marketing profile · student #{studentId}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          )}
          {isError && <p className="text-sm text-red-600">Could not load this student.</p>}
          {detail && <Body d={detail} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
