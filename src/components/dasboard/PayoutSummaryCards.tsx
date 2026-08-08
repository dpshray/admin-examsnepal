"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, Wallet } from "lucide-react";
import StatCard from "@/components/dasboard/StatsCard";
import { payoutService } from "@/service/payout.service";

function formatCurrency(value: number) {
    return `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const EMPTY_SUMMARY = {
    pending_count: 0,
    pending_amount: 0,
    approved_count: 0,
    approved_amount: 0,
    paid_count: 0,
    paid_amount: 0,
};

export default function PayoutSummaryCards() {
    const { data } = useQuery({
        queryKey: ["admin-payouts-summary"],
        queryFn: async () => {
            const res = await payoutService.getSummary();
            return res?.data ?? EMPTY_SUMMARY;
        },
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                title="Pending Approval"
                value={`${formatCurrency(data?.pending_amount ?? 0)} (${data?.pending_count ?? 0})`}
                icon={<Clock className="h-5 w-5" />}
            />
            <StatCard
                title="Approved, Awaiting Payment"
                value={`${formatCurrency(data?.approved_amount ?? 0)} (${data?.approved_count ?? 0})`}
                icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatCard
                title="Paid"
                value={`${formatCurrency(data?.paid_amount ?? 0)} (${data?.paid_count ?? 0})`}
                icon={<Wallet className="h-5 w-5" />}
            />
        </div>
    );
}
