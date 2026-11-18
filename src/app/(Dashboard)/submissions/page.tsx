"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle, Clock, CalendarDays } from "lucide-react";
import { SubmissionsTable } from "@/components/table/submission-table";
import StatCard from "@/components/dasboard/StatsCard";
import { fmtInt } from "@/components/marketing/labels";
import { studentService } from "@/service/student.service";

interface SubmissionStats {
    total: number;
    completed: number;
    not_completed: number;
    completed_last_30_days: number;
}

export default function SubmissionsPage() {
    const { data } = useQuery({
        queryKey: ["submission-stats"],
        queryFn: () => studentService.getSubmissionStats(),
    });
    const stats: SubmissionStats | undefined = data?.data;
    const show = (value?: number) => (value === undefined ? "–" : fmtInt(value));

    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Submissions
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Track student exam attempts, completion and scores.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Submissions"
                    value={show(stats?.total)}
                    icon={<FileText className="h-5 w-5" />}
                />
                <StatCard
                    title="Completed"
                    value={show(stats?.completed)}
                    icon={<CheckCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Not Completed"
                    value={show(stats?.not_completed)}
                    icon={<Clock className="h-5 w-5" />}
                />
                <StatCard
                    title="Completed · last 30 days"
                    value={show(stats?.completed_last_30_days)}
                    icon={<CalendarDays className="h-5 w-5" />}
                />
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-4 sm:p-6">
                    <SubmissionsTable />
                </div>
            </div>
        </div>
    );
}
