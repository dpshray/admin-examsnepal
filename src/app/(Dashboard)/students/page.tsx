"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, UserCheck, Users, UserX } from "lucide-react";
import StatCard from "@/components/dasboard/StatsCard";
import { fmtInt } from "@/components/marketing/labels";
import { StudentsDataTable } from "@/components/table/StudentTable";
import { studentService } from "@/service/student.service";

interface StudentStats {
    total: number;
    active: number;
    inactive: number;
    new_this_month: number;
}

export default function StudentsPage() {
    const { data } = useQuery({
        queryKey: ["student-stats"],
        queryFn: () => studentService.getStats(),
    });
    const stats: StudentStats | undefined = data?.data;
    const show = (value?: number) => (value === undefined ? "–" : fmtInt(value));

    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Students
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Manage student records, subscriptions, enrollment status, and contact
                    details from one place.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Students"
                    value={show(stats?.total)}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="Active · last 30 days"
                    value={show(stats?.active)}
                    icon={<UserCheck className="h-5 w-5" />}
                />
                <StatCard
                    title="Inactive · last 30 days"
                    value={show(stats?.inactive)}
                    icon={<UserX className="h-5 w-5" />}
                />
                <StatCard
                    title="New This Month"
                    value={show(stats?.new_this_month)}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-4 sm:p-6">
                    <StudentsDataTable />
                </div>
            </div>
        </div>
    );
}
