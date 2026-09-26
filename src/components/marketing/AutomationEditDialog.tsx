"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmailTemplates, usePromoteVariant, useUpdateAutomation } from "@/hooks/useMarketing";
import type { AutomationRow, EmailTemplateRow } from "@/types/Marketing";
import { fmtInt, fmtPct } from "./labels";

const NONE = "__none__";

function AbPanel({ automation }: { automation: AutomationRow }) {
  const promote = usePromoteVariant();
  const ab = automation.ab;
  if (!ab) return null;

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-xs font-semibold text-gray-900">A/B test: judged on goal conversion</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {(["A", "B"] as const).map((v) => {
          const r = ab.variants[v];
          const win = ab.winner === v;
          return (
            <div key={v} className={`rounded-md border p-2 ${win ? "border-green-300 bg-green-50" : ""}`}>
              <div className="flex items-center justify-between font-medium">
                Variant {v} {win && <Trophy className="h-3.5 w-3.5 text-green-700" aria-label="Winner" />}
              </div>
              <div className="truncate text-muted-foreground">{r.template_key}</div>
              <div className="mt-1 tabular-nums">{fmtPct(r.goal_rate)} goal · {fmtInt(r.goal_met)}/{fmtInt(r.sent)}</div>
              <Button type="button" size="sm" variant={win ? "default" : "outline"} className="mt-2 h-7 w-full text-xs"
                disabled={promote.isPending} onClick={() => promote.mutate({ id: automation.id, variant: v })}>
                Keep {v}, end test
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {ab.needs_more_data
          ? "Not enough data yet: each variant needs 100+ sends before a winner is called."
          : ab.winner
            ? `Variant ${ab.winner} wins with ${ab.confidence} confidence.`
            : "No significant difference yet. Keep the test running or pick one."}
      </p>
    </div>
  );
}

export default function AutomationEditDialog({ automation, onClose }: { automation: AutomationRow | null; onClose: () => void }) {
  const update = useUpdateAutomation();
  const { data } = useEmailTemplates();
  const templates: EmailTemplateRow[] = data?.data?.templates ?? [];
  const [form, setForm] = useState({ delay_minutes: "0", cooldown_days: "30", priority: "50", template_key: "", variant_b_template_key: "", ab_split_pct: "50" });

  useEffect(() => {
    if (!automation) return;
    setForm({
      delay_minutes: String(automation.delay_minutes),
      cooldown_days: String(automation.cooldown_days),
      priority: String(automation.priority),
      template_key: automation.template_key,
      variant_b_template_key: automation.variant_b_template_key ?? "",
      ab_split_pct: String(automation.ab_split_pct),
    });
  }, [automation]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open={!!automation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{automation?.name}</DialogTitle>
          <DialogDescription>Timing, priority and A/B test. Conditions and triggers are set in code (StarterCatalog).</DialogDescription>
        </DialogHeader>
        {automation && (
          <form
            id="automation-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate(
                {
                  id: automation.id,
                  data: {
                    delay_minutes: Number(form.delay_minutes),
                    cooldown_days: Number(form.cooldown_days),
                    priority: Number(form.priority),
                    template_key: form.template_key,
                    variant_b_template_key: form.variant_b_template_key || null,
                    ab_split_pct: Number(form.ab_split_pct),
                  },
                },
                { onSuccess: onClose },
              );
            }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="a-delay">Delay (min)</Label>
                <Input id="a-delay" type="number" min={0} value={form.delay_minutes} onChange={(e) => set({ delay_minutes: e.target.value })} disabled={automation.trigger_type !== "event"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-cool">Cooldown (days)</Label>
                <Input id="a-cool" type="number" min={0} value={form.cooldown_days} onChange={(e) => set({ cooldown_days: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-prio">Priority</Label>
                <Input id="a-prio" type="number" min={0} max={1000} value={form.priority} onChange={(e) => set({ priority: e.target.value })} />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Priority decides which email wins when several are due for the same student (higher wins; broadcasts rank 50).
            </p>

            <div className="grid grid-cols-[1fr_1fr_5rem] gap-3">
              <div className="space-y-1">
                <Label>Template (A)</Label>
                <Select value={form.template_key} onValueChange={(v) => set({ template_key: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{templates.map((t) => <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Variant B</Label>
                <Select value={form.variant_b_template_key || NONE} onValueChange={(v) => set({ variant_b_template_key: v === NONE ? "" : v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No A/B test</SelectItem>
                    {templates.filter((t) => t.key !== form.template_key).map((t) => <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-split">% A</Label>
                <Input id="a-split" type="number" min={1} max={99} value={form.ab_split_pct} onChange={(e) => set({ ab_split_pct: e.target.value })} disabled={!form.variant_b_template_key} />
              </div>
            </div>

            <AbPanel automation={automation} />
          </form>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="automation-form" disabled={update.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
