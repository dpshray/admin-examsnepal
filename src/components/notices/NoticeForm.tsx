"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNoticeMeta, useNoticeSources } from "@/hooks/useNotices";
import type { Notice, NoticeMeta, NoticePost, NoticeSource } from "@/types/Notice";
import { humanize } from "./NoticeBadges";

type FormState = {
  source_id: string;
  category: string;
  sub_category: string;
  organization: string;
  province: string;
  title_original: string;
  title_en: string;
  title_ne: string;
  summary_en: string;
  summary_ne: string;
  source_url: string;
  attachments: string;
  published_date_bs: string;
  published_date_ad: string;
  application_start_ad: string;
  application_deadline_ad: string;
  double_fee_deadline_ad: string;
  exam_date_bs: string;
  exam_date_ad: string;
  notice_type: string;
  posts: NoticePost[];
  exam_tags: string[];
  is_featured: boolean;
};

const NONE = "__none__";

function toState(notice?: Notice | null): FormState {
  return {
    source_id: notice?.source_id ? String(notice.source_id) : NONE,
    category: notice?.category ?? "loksewa",
    sub_category: notice?.sub_category ?? NONE,
    organization: notice?.organization ?? "",
    province: notice?.province ?? NONE,
    title_original: notice?.title_original ?? "",
    title_en: notice?.title_en ?? "",
    title_ne: notice?.title_ne ?? "",
    summary_en: notice?.summary_en ?? "",
    summary_ne: notice?.summary_ne ?? "",
    source_url: notice?.source_url ?? "",
    attachments: (notice?.attachment_urls ?? []).map((a) => a.url).join("\n"),
    published_date_bs: notice?.published_date_bs ?? "",
    published_date_ad: notice?.published_date_ad?.slice(0, 10) ?? "",
    application_start_ad: notice?.application_start_ad?.slice(0, 10) ?? "",
    application_deadline_ad: notice?.application_deadline_ad?.slice(0, 10) ?? "",
    double_fee_deadline_ad: notice?.double_fee_deadline_ad?.slice(0, 10) ?? "",
    exam_date_bs: notice?.exam_date_bs ?? "",
    exam_date_ad: notice?.exam_date_ad?.slice(0, 10) ?? "",
    notice_type: notice?.notice_type ?? "other",
    posts: notice?.posts ?? [],
    exam_tags: notice?.exam_tags ?? [],
    is_featured: notice?.is_featured ?? false,
  };
}

/** Turns form state into the admin API payload (empty strings -> null). */
export function toPayload(s: FormState): Record<string, unknown> {
  const orNull = (v: string) => (v.trim() === "" || v === NONE ? null : v.trim());
  return {
    source_id: orNull(s.source_id),
    category: s.category,
    sub_category: orNull(s.sub_category),
    organization: s.organization.trim(),
    province: orNull(s.province),
    title_original: s.title_original.trim(),
    title_en: orNull(s.title_en),
    title_ne: orNull(s.title_ne),
    summary_en: orNull(s.summary_en),
    summary_ne: orNull(s.summary_ne),
    source_url: s.source_url.trim(),
    attachment_urls: s.attachments
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((url) => ({ url })),
    published_date_bs: orNull(s.published_date_bs),
    // BS wins when both are filled; the API derives the other calendar.
    published_date_ad: orNull(s.published_date_bs) ? null : orNull(s.published_date_ad),
    application_start_ad: orNull(s.application_start_ad),
    application_deadline_ad: orNull(s.application_deadline_ad),
    double_fee_deadline_ad: orNull(s.double_fee_deadline_ad),
    exam_date_bs: orNull(s.exam_date_bs),
    exam_date_ad: orNull(s.exam_date_bs) ? null : orNull(s.exam_date_ad),
    notice_type: s.notice_type,
    posts: s.posts.filter((p) => p.name.trim() !== ""),
    exam_tags: s.exam_tags,
    is_featured: s.is_featured,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SelectField({ value, onChange, options, placeholder, allowNone }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  allowNone?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value={NONE}>—</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {humanize(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function NoticeForm({
  notice,
  submitting,
  onSubmit,
  submitLabel = "Save",
  extraActions,
}: {
  notice?: Notice | null;
  submitting?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  submitLabel?: string;
  extraActions?: React.ReactNode;
}) {
  const [state, setState] = useState<FormState>(() => toState(notice));
  const [tagQuery, setTagQuery] = useState("");
  const { data: metaRes } = useNoticeMeta();
  const { data: sourcesRes } = useNoticeSources();
  const meta: NoticeMeta | undefined = metaRes?.data;
  const sources: NoticeSource[] = sourcesRes?.data ?? [];

  useEffect(() => setState(toState(notice)), [notice]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setState((s) => ({ ...s, [key]: value }));

  const tagOptions = useMemo(() => {
    const all = Object.entries(meta?.exam_tags ?? {});
    const q = tagQuery.toLowerCase();
    return all.filter(([slug, label]) => !state.exam_tags.includes(slug) && (!q || slug.includes(q) || label.toLowerCase().includes(q))).slice(0, 12);
  }, [meta, tagQuery, state.exam_tags]);

  const updatePost = (i: number, key: keyof NoticePost, value: string) =>
    set(
      "posts",
      state.posts.map((p, idx) => (idx === i ? { ...p, [key]: key === "seats" ? (value === "" ? null : Number(value)) : value || null } : p)),
    );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toPayload(state));
      }}
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Source">
          <Select
            value={state.source_id}
            onValueChange={(v) => {
              const src = sources.find((s) => String(s.id) === v);
              setState((s) => ({
                ...s,
                source_id: v,
                ...(src && !notice ? { organization: src.organization, category: src.category, sub_category: src.sub_category, province: src.province ?? NONE } : {}),
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Manual entry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Manual entry (no source)</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Organization *">
          <Input value={state.organization} onChange={(e) => set("organization", e.target.value)} required />
        </Field>
        <Field label="Category *">
          <SelectField value={state.category} onChange={(v) => set("category", v)} options={meta?.categories ?? ["loksewa", "entrance", "license"]} />
        </Field>
        <Field label="Sub-category">
          <SelectField
            value={state.sub_category}
            onChange={(v) => set("sub_category", v)}
            options={meta?.sub_categories?.[state.category as keyof NoticeMeta["sub_categories"]] ?? []}
            allowNone
          />
        </Field>
        <Field label="Notice type">
          <SelectField value={state.notice_type} onChange={(v) => set("notice_type", v)} options={meta?.types ?? []} />
        </Field>
        <Field label="Province">
          <SelectField value={state.province} onChange={(v) => set("province", v)} options={meta?.provinces ?? []} allowNone />
        </Field>
      </section>

      <section className="grid gap-4">
        <Field label="Title as published *">
          <Textarea rows={2} value={state.title_original} onChange={(e) => set("title_original", e.target.value)} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (English)" hint="Optional. Shown instead of the original title and used for the URL until first published.">
            <Input value={state.title_en} onChange={(e) => set("title_en", e.target.value)} />
          </Field>
          <Field label="Title (Nepali)">
            <Input value={state.title_ne} onChange={(e) => set("title_ne", e.target.value)} />
          </Field>
          <Field label="Summary (English)">
            <Textarea rows={4} value={state.summary_en} onChange={(e) => set("summary_en", e.target.value)} />
          </Field>
          <Field label="Summary (Nepali)">
            <Textarea rows={4} value={state.summary_ne} onChange={(e) => set("summary_ne", e.target.value)} />
          </Field>
        </div>
        <Field label="Official notice URL *">
          <Input type="url" value={state.source_url} onChange={(e) => set("source_url", e.target.value)} required />
        </Field>
        <Field label="Attachment URLs" hint="One official PDF/image URL per line.">
          <Textarea rows={2} value={state.attachments} onChange={(e) => set("attachments", e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Field label="Published (BS)" hint="e.g. 2083-06-08 — takes precedence; AD is derived">
          <Input value={state.published_date_bs} onChange={(e) => set("published_date_bs", e.target.value)} placeholder="YYYY-MM-DD" />
        </Field>
        <Field label="Published (AD)">
          <Input type="date" value={state.published_date_ad} onChange={(e) => set("published_date_ad", e.target.value)} />
        </Field>
        <Field label="Application opens (AD)">
          <Input type="date" value={state.application_start_ad} onChange={(e) => set("application_start_ad", e.target.value)} />
        </Field>
        <Field label="Application deadline (AD)">
          <Input type="date" value={state.application_deadline_ad} onChange={(e) => set("application_deadline_ad", e.target.value)} />
        </Field>
        <Field label="Double-fee deadline (AD)">
          <Input type="date" value={state.double_fee_deadline_ad} onChange={(e) => set("double_fee_deadline_ad", e.target.value)} />
        </Field>
        <Field label="Exam date (BS)" hint="Takes precedence over the AD field">
          <Input value={state.exam_date_bs} onChange={(e) => set("exam_date_bs", e.target.value)} placeholder="YYYY-MM-DD" />
        </Field>
        <Field label="Exam date (AD)">
          <Input type="date" value={state.exam_date_ad} onChange={(e) => set("exam_date_ad", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700">Posts</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => set("posts", [...state.posts, { name: "", service_group: null, level: null, seats: null, qualification: null }])}
          >
            <Plus className="h-3.5 w-3.5" /> Add post
          </Button>
        </div>
        {state.posts.map((post, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-[2fr_1.5fr_1fr_0.7fr_2fr_auto]">
            <Input placeholder="Post" value={post.name} onChange={(e) => updatePost(i, "name", e.target.value)} />
            <Input placeholder="Service / group" value={post.service_group ?? ""} onChange={(e) => updatePost(i, "service_group", e.target.value)} />
            <Input placeholder="Level" value={post.level ?? ""} onChange={(e) => updatePost(i, "level", e.target.value)} />
            <Input placeholder="Seats" type="number" min={0} value={post.seats ?? ""} onChange={(e) => updatePost(i, "seats", e.target.value)} />
            <Input placeholder="Qualification" value={post.qualification ?? ""} onChange={(e) => updatePost(i, "qualification", e.target.value)} />
            <Button type="button" size="icon" variant="ghost" onClick={() => set("posts", state.posts.filter((_, idx) => idx !== i))} aria-label="Remove post">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Exam tags (links to mock tests)</Label>
        <div className="flex flex-wrap gap-1.5">
          {state.exam_tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => set("exam_tags", state.exam_tags.filter((t) => t !== tag))}
              className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800 ring-1 ring-green-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
              title="Remove"
            >
              {meta?.exam_tags?.[tag] ?? tag} ×
            </button>
          ))}
        </div>
        <Input placeholder="Search tags…" value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} />
        {tagQuery && (
          <div className="flex flex-wrap gap-1.5">
            {tagOptions.map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  set("exam_tags", [...state.exam_tags, slug]);
                  setTagQuery("");
                }}
                className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-gray-200 hover:bg-green-50"
              >
                + {label}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={state.is_featured} onCheckedChange={(v) => set("is_featured", v)} /> Featured
        </label>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
