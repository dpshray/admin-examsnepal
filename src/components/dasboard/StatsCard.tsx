import React from "react";

export default function StatCard({
                                     title,
                                     value,
                                     icon,
                                 }: {
    title: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="text-muted-foreground">{icon}</div>
            </div>

            <div className="mt-2">
                <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
            </div>
        </div>
    );
}