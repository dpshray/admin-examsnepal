"use client";

import { useState } from "react";
import { Eye, Settings2 } from "lucide-react";
import AutomationEditDialog from "./AutomationEditDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAutomationPreview, useAutomations, useUpdateAutomation } from "@/hooks/useMarketing";
import type { AutomationRow, AutomationStats, DryRun } from "@/types/Marketing";
import { EVENT_LABELS, fmtInt, fmtPct } from "./labels";

const REASON_LABELS: Record<string, string> = {
  unsubscribed: "Unsubscribed",
  suppressed_address: "Bounced / blocked address",
  no_email: "No valid email",
  paying_student: "Already paying",
  conditions_not_met: "No longer matches",
  cooldown: "Got it recently (cooldown)",
  frequency_cap: "Frequency cap (48h / 3 per week)",
};

function total(stats: AutomationStats[]) {
  const sum = (k: keyof AutomationStats) => stats.reduce((n, s) => n + (Number(s[k]) || 0), 0);
  const sent = sum("sent");
  const rate = (n: number) => (sent ? (n / sent) * 100 : null);
  return { sent, open: rate(sum("opened")), click: rate(sum("clicked")), goal: rate(sum("goal_met")), unsub: sum("unsubscribed"), bounced: sum("bounced") };
}

function describeTrigger(a: AutomationRow) {
  if (a.trigger_type === "event") {
    const delay = a.delay_minutes ? ` + ${a.delay_minutes >= 60 ? `${Math.round(a.delay_minutes / 60)}h` : `${a.delay_minutes}m`}` : "";
    return `On “${EVENT_LABELS[a.trigger_event ?? ""] ?? a.trigger_event}”${delay}`;
  }
  if (a.schedule?.hours?.length) {
    const days = a.schedule.weekdays?.length ? a.schedule.weekdays.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ") + " " : "Daily ";
    return `${days}${a.schedule.hours.map((h) => `${String(h).padStart(2, "0")}:00`).join(", ")}`;
  }
  return "Hourly check";
}

function PreviewDialog({ automation, onClose }: { automation: AutomationRow | null; onClose: () => void }) {
  const { data, isLoading, isError } = useAutomationPreview(automation?.id ?? null);
  const run: DryRun | undefined = data?.data;

  return (
    <Dialog open={!!automation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Dry run · {automation?.name}</DialogTitle>
          <DialogDescription>{run?.note ?? "Who would receive this right now. Nothing is sent."}</DialogDescription>
        </DialogHeader>
        {isLoading && <Skeleton className="h-40" />}
        {isError && <p className="text-sm text-red-600">Dry run failed.</p>}
        {run && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Match the conditions</p>
                <p className="text-xl font-semibold tabular-nums">{fmtInt(run.candidates)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Would receive it</p>
                <p className="text-xl font-semibold tabular-nums text-green-700">{fmtInt(run.would_send)}</p>
              </div>
            </div>
            {Object.keys(run.skipped).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-700">Skipped by guardrails</p>
                <ul className="space-y-0.5 text-xs">
                  {Object.entries(run.skipped).map(([k, n]) => (
                    <li key={k} className="flex justify-between"><span className="text-gray-600">{REASON_LABELS[k] ?? k}</span><span className="tabular-nums">{fmtInt(n)}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {run.sample.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-700">First {run.sample.length} recipients</p>
                <ul className="max-h-48 divide-y overflow-y-auto rounded-md border text-xs">
                  {run.sample.map((s) => (
                    <li key={s.student_id} className="flex justify-between gap-2 px-2 py-1"><span className="truncate">{s.name}</span><span className="truncate text-muted-foreground">{s.email}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AutomationsPanel() {
  const [days, setDays] = useState(30);
  const [previewing, setPreviewing] = useState<AutomationRow | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const { data, isLoading, isError } = useAutomations(days);
  const update = useUpdateAutomation();
  const rows: AutomationRow[] = data?.data?.automations ?? [];

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (isError) return <p className="text-sm text-red-600">Failed to load automations.</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Goal = the student did what the email asked (e.g. took their first exam) within 72 hours. It is the main success measure; open rate is secondary.
        </p>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="h-8 w-32 shrink-0 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{[7, 30, 90].map((d) => <SelectItem key={d} value={String(d)}>Last {d} days</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No automations yet. Install the starter set on the server: php artisan marketing:install-starter
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Active</th>
                <th className="px-3 py-2 text-left font-medium">Automation</th>
                <th className="px-3 py-2 text-left font-medium">Trigger</th>
                <th className="px-3 py-2 text-right font-medium">Priority</th>
                <th className="px-3 py-2 text-right font-medium">Sent</th>
                <th className="px-3 py-2 text-right font-medium">Goal met</th>
                <th className="px-3 py-2 text-right font-medium">Click</th>
                <th className="px-3 py-2 text-right font-medium">Open</th>
                <th className="px-3 py-2 text-right font-medium">Unsub · bounce</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((a) => {
                const t = total(a.stats);
                return (
                  <tr key={a.id} className={a.is_active ? "" : "text-muted-foreground"}>
                    <td className="px-3 py-2">
                      <Switch
                        checked={a.is_active}
                        disabled={update.isPending}
                        onCheckedChange={(v) => update.mutate({ id: a.id, data: { is_active: v } })}
                        aria-label={`Turn ${a.name} ${a.is_active ? "off" : "on"}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{a.name}</div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        <span className="text-muted-foreground">{a.template_name ?? a.template_key}</span>
                        {a.channel !== "email" && (
                          <Badge variant="outline" className="h-4 px-1 text-[10px]" title={a.channel === "auto" ? "Push if the app is installed, else email" + (a.allow_sms ? ", else SMS" : "") : undefined}>
                            {a.channel === "auto" ? `push→email${a.allow_sms ? "→SMS" : ""}` : a.channel}
                          </Badge>
                        )}
                        {a.variant_b_template_key && <Badge variant="outline" className="h-4 px-1 text-[10px]">A/B</Badge>}
                        {a.is_upsell && <Badge variant="outline" className="h-4 px-1 text-[10px]">Upsell</Badge>}
                        {a.queued > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{a.queued} queued</Badge>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{describeTrigger(a)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.priority}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtInt(t.sent)}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900">{fmtPct(t.goal)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtPct(t.click)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtPct(t.open)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{t.unsub} · {t.bounced}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPreviewing(a)}>
                          <Eye className="h-3.5 w-3.5" /> Dry run
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setEditing(a.id)}>
                          <Settings2 className="h-3.5 w-3.5" /> Settings
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <PreviewDialog automation={previewing} onClose={() => setPreviewing(null)} />
      <AutomationEditDialog automation={rows.find((r) => r.id === editing) ?? null} onClose={() => setEditing(null)} />
    </div>
  );
}
