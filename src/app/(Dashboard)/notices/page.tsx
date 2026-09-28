"use client";

import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoticesTable from "@/components/notices/NoticesTable";
import ReportsTable from "@/components/notices/ReportsTable";
import { useNoticeStats } from "@/hooks/useNotices";

export default function NoticesPage() {
  const router = useRouter();
  const { data } = useNoticeStats();
  const stats = data?.data;
  const pending = stats?.by_status?.pending ?? 0;

  const cards = [
    { label: "Awaiting review", value: pending, tone: "text-amber-700" },
    { label: "Published", value: stats?.by_status?.published ?? 0, tone: "text-green-700" },
    { label: "AI extraction failed", value: stats?.enrichment_failures ?? 0, tone: "text-red-600" },
    { label: "Open error reports", value: stats?.open_reports ?? 0, tone: "text-amber-700" },
    {
      label: "AI tokens (30 days)",
      value: stats?.tokens_last_30_days ? `${Math.round((Number(stats.tokens_last_30_days.input) + Number(stats.tokens_last_30_days.output)) / 1000)}k` : "0",
      tone: "text-gray-900",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Megaphone}
        title="Notices"
        description="Official Loksewa, entrance and license notices collected from government sites. Review AI-extracted fields before publishing."
        actionLabel="Add notice manually"
        onAction={() => router.push("/notices/new")}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="review" className="space-y-4">
        <TabsList>
          <TabsTrigger value="review">Review queue{pending ? ` (${pending})` : ""}</TabsTrigger>
          <TabsTrigger value="all">All notices</TabsTrigger>
          <TabsTrigger value="reports">Error reports{stats?.open_reports ? ` (${stats.open_reports})` : ""}</TabsTrigger>
        </TabsList>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <TabsContent value="review">
            <NoticesTable status="pending" />
          </TabsContent>
          <TabsContent value="all">
            <NoticesTable />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTable />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
