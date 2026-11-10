"use client";

import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Clock, CheckCircle } from "lucide-react";
import StatCard from "@/components/dasboard/StatsCard";
import { fmtInt } from "@/components/marketing/labels";
import { DoubtsTable } from "@/components/table/doubts-tabel";
import { doubtService } from "@/service/doubt.service";

export default function DoubtsPage() {
    // Under the "doubts" key so resolving a doubt in the table refreshes these too.
    const { data } = useQuery({
        queryKey: ["doubts", "stats"],
        queryFn: () => doubtService.getStats(),
    });
    const stats: { total: number; resolved: number; pending: number } | undefined = data?.data;
    const show = (value?: number) => (value === undefined ? "–" : fmtInt(value));

    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Doubts
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Manage student doubts, track resolution status, and ensure timely
                    responses.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Doubts"
                    value={show(stats?.total)}
                    icon={<HelpCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Resolved"
                    value={show(stats?.resolved)}
                    icon={<CheckCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Pending"
                    value={show(stats?.pending)}
                    icon={<Clock className="h-5 w-5" />}
                />
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-4 sm:p-6">
                    <DoubtsTable />
                </div>
            </div>
        </div>
    );
}
