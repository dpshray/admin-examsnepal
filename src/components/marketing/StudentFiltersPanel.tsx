"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-Debounce";
import type { MarketingMeta, StudentFilters } from "@/types/Marketing";
import { STAGE_LABELS, SUBSCRIPTION_LABELS, segmentLabel } from "./labels";

const ANY = "__any__";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Choice({
  value,
  onChange,
  options,
  placeholder = "Any",
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger className="h-8 w-full text-xs"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{placeholder}</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Range({
  min,
  max,
  onChange,
  placeholder = ["Min", "Max"],
}: {
  min?: string;
  max?: string;
  onChange: (min: string, max: string) => void;
  placeholder?: [string, string];
}) {
  return (
    <div className="flex items-center gap-1">
      <Input type="number" min={0} value={min ?? ""} placeholder={placeholder[0]} className="h-8 text-xs" onChange={(e) => onChange(e.target.value, max ?? "")} />
      <span className="text-xs text-muted-foreground">–</span>
      <Input type="number" min={0} value={max ?? ""} placeholder={placeholder[1]} className="h-8 text-xs" onChange={(e) => onChange(min ?? "", e.target.value)} />
    </div>
  );
}

/** All list filters; changes are applied immediately (search is debounced). */
export default function StudentFiltersPanel({
  filters,
  meta,
  onChange,
}: {
  filters: StudentFilters;
  meta?: MarketingMeta;
  onChange: (next: StudentFilters) => void;
}) {
  const [search, setSearch] = useState(filters.search ?? "");
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    if ((debounced ?? "") !== (filters.search ?? "")) onChange({ ...filters, search: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => setSearch(filters.search ?? ""), [filters.search]);

  const set = (patch: Partial<StudentFilters>) => onChange({ ...filters, ...patch });
  const active = Object.entries(filters).filter(([, v]) => v !== undefined && v !== "").length;
  const examTypes = meta?.exam_types ?? [];

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Field label="Search">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" className="h-8 text-xs" type="search" />
          </Field>
        </div>
        <div className="w-full sm:w-56">
          <Field label="Saved segment">
            <Choice
              value={filters.segment_id}
              onChange={(v) => set({ segment_id: v })}
              options={(meta?.saved_segments ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
              placeholder="None"
            />
          </Field>
        </div>
        {active > 0 && (
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => onChange({})}>
            <X className="h-3.5 w-3.5" /> Clear {active} filter{active > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Field label="Lifecycle stage">
          <Choice value={filters.stage} onChange={(v) => set({ stage: v })}
            options={(meta?.stages ?? []).map((s) => ({ value: s, label: STAGE_LABELS[s] }))} />
        </Field>
        <Field label="Segment">
          <Choice value={filters.segment} onChange={(v) => set({ segment: v })}
            options={(meta?.segments ?? []).map((s) => ({ value: s, label: segmentLabel(s, examTypes) }))} />
        </Field>
        <Field label="Target exam">
          <Choice value={filters.exam_type_id} onChange={(v) => set({ exam_type_id: v })}
            options={examTypes.map((t) => ({ value: String(t.id), label: t.name }))} />
        </Field>
        <Field label="Has taken">
          <Choice value={filters.exam_type_taken} onChange={(v) => set({ exam_type_taken: v })}
            options={[{ value: "free", label: "Free quiz" }, { value: "sprint", label: "Sprint" }, { value: "mock", label: "Mock test" }, { value: "sprint,mock", label: "Sprint or Mock" }, { value: "topic", label: "Topic quiz" }]} />
        </Field>
        <Field label="Subscription">
          <Choice value={filters.subscription_status} onChange={(v) => set({ subscription_status: v })}
            options={(meta?.subscription_statuses ?? []).map((s) => ({ value: s, label: SUBSCRIPTION_LABELS[s] }))} />
        </Field>
        <Field label="Platform">
          <Choice value={filters.platform} onChange={(v) => set({ platform: v as StudentFilters["platform"] })}
            options={[{ value: "app", label: "App user" }, { value: "web", label: "Web only" }]} />
        </Field>
        <Field label="Total exams">
          <Range min={filters.attempts_min} max={filters.attempts_max} onChange={(a, b) => set({ attempts_min: a, attempts_max: b })} />
        </Field>
        <Field label="Avg score %">
          <Range min={filters.score_min} max={filters.score_max} onChange={(a, b) => set({ score_min: a, score_max: b })} />
        </Field>
        <Field label="Inactive (days)">
          <Range min={filters.inactive_days_min} max={filters.inactive_days_max} placeholder={["≥ days", "≤ days"]}
            onChange={(a, b) => set({ inactive_days_min: a, inactive_days_max: b })} />
        </Field>
        <Field label="Signed up">
          <div className="flex items-center gap-1">
            <Input type="date" value={filters.signed_up_from ?? ""} className="h-8 px-1.5 text-xs" onChange={(e) => set({ signed_up_from: e.target.value })} aria-label="Signed up from" />
            <Input type="date" value={filters.signed_up_to ?? ""} className="h-8 px-1.5 text-xs" onChange={(e) => set({ signed_up_to: e.target.value })} aria-label="Signed up to" />
          </div>
        </Field>
        <Field label="Lead score ≥">
          <Input type="number" min={0} max={100} value={filters.lead_min ?? ""} className="h-8 text-xs" onChange={(e) => set({ lead_min: e.target.value })} />
        </Field>
        <Field label="Tag">
          <Choice value={filters.tag} onChange={(v) => set({ tag: v })} options={(meta?.tags ?? []).map((t) => ({ value: t, label: t }))} />
        </Field>
        {!!meta?.signup_sources.length && (
          <Field label="Signup source">
            <Choice value={filters.signup_source} onChange={(v) => set({ signup_source: v })}
              options={meta.signup_sources.map((s) => ({ value: s, label: s }))} />
          </Field>
        )}
      </div>
    </div>
  );
}
