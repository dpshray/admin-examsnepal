"use client";

import ExamTagTable from "@/components/table/ExamTagTable";

export default function ExamTagPage() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Exam Tags
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Create and manage different tags of exams.
                </p>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-4 sm:p-6">
                    <ExamTagTable />
                </div>
            </div>
        </div>
    );
}
