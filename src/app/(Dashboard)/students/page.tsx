"use client";

import React from "react";
import { TrendingUp, UserCheck, Users, UserX } from "lucide-react";
import { StudentsDataTable } from "@/app/(Dashboard)/students/StudentTable";
import StatCard from "@/components/dasboard/StatsCard";

export default function StudentsPage() {
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
                    value="2,450"
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="Active Students"
                    value="1,980"
                    icon={<UserCheck className="h-5 w-5" />}
                />
                <StatCard
                    title="Inactive"
                    value="320"
                    icon={<UserX className="h-5 w-5" />}
                />
                <StatCard
                    title="New This Month"
                    value="+150"
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
