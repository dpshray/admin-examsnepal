"use client";

import React from "react";
import { MessageCircle, HelpCircle, Clock, CheckCircle } from "lucide-react";
import { DoubtsTable } from "@/app/(Dashboard)/doubts/doubts-tabel";
import StatCard from "@/components/dasboard/StatsCard";

export default function DoubtsPage() {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Doubts"
                    value="1,240"
                    icon={<HelpCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Resolved"
                    value="860"
                    icon={<CheckCircle className="h-5 w-5" />}
                />
                <StatCard
                    title="Pending"
                    value="280"
                    icon={<Clock className="h-5 w-5" />}
                />
                <StatCard
                    title="Active Discussions"
                    value="100"
                    icon={<MessageCircle className="h-5 w-5" />}
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
