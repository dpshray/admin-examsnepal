"use client";

import React from "react";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { SubmissionsTable } from "@/components/table/submission-table";
import StatCard from "@/components/dasboard/StatsCard";

export default function SubmissionsPage() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Submissions
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Track student submissions, review status, and grading progress across
                    all courses.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Submissions"
                    value="5,420"
                    icon={<FileText className="h-5 w-5" />}
                />
                <StatCard
                    title="Reviewed"
                    value="3,980"
                    icon={<CheckCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Pending Review"
                    value="1,120"
                    icon={<Clock className="h-5 w-5" />}
                />
                <StatCard
                    title="Rejected"
                    value="320"
                    icon={<XCircle className="h-5 w-5" />}
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
