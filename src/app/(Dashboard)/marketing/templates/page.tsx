"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateEditor from "@/components/marketing/TemplateEditor";
import { useEmailTemplates } from "@/hooks/useMarketing";
import type { EmailTemplateRow } from "@/types/Marketing";

const NEW = "__new__";

export default function EmailTemplatesPage() {
  const { data, isLoading } = useEmailTemplates();
  const templates: EmailTemplateRow[] = data?.data?.templates ?? [];
  const variables: string[] = data?.data?.variables ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  const current = selected === NEW ? null : templates.find((t) => t.key === selected) ?? templates[0] ?? null;
  const activeKey = selected === NEW ? NEW : current?.key;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={FileText}
        title="Email templates"
        description="Edit copy with a live preview using real student data. Changes apply to the next emails sent."
        actionLabel="New template"
        onAction={() => setSelected(NEW)}
        buttonClassName="bg-green-700 text-white hover:bg-green-800"
      />

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
          <nav className="max-h-[75vh] overflow-y-auto rounded-xl border bg-card p-2 shadow-sm" aria-label="Templates">
            {templates.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelected(t.key)}
                className={`block w-full rounded-md px-2.5 py-2 text-left text-xs ${activeKey === t.key ? "bg-green-50 text-green-900" : "hover:bg-muted"}`}
              >
                <span className="block truncate font-medium">{t.name}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  {t.category}
                  {!t.is_active && <Badge variant="outline" className="h-4 px-1 text-[10px]">inactive</Badge>}
                  {t.used_by.length === 0 && <Badge variant="outline" className="h-4 px-1 text-[10px]">unused</Badge>}
                </span>
              </button>
            ))}
            {templates.length === 0 && <p className="p-3 text-xs text-muted-foreground">No templates. Run marketing:install-starter or create one.</p>}
          </nav>
          <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            {(current || selected === NEW) ? (
              <TemplateEditor
                key={activeKey}
                template={current}
                variables={variables}
                onSaved={(key) => setSelected(key)}
                onDeleted={() => setSelected(null)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pick a template.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
