"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { payoutService } from "@/service/payout.service";

interface PayoutDetail {
    id: number;
    teacher: { id: number; name: string; email: string } | null;
    exam_type: { id: number; name: string } | null;
    period_start: string;
    period_end: string;
    revenue_amount: number;
    pool_percentage_used: number;
    pool_amount: number;
    teacher_unique_completions: number;
    total_unique_completions: number;
    share_percentage: number;
    payout_amount: number;
    status: string;
    remark: string | null;
    approver: { id: number; name: string } | null;
    approved_at: string | null;
    paid_at: string | null;
    exams: {
        exam_id: number;
        exam_name: string | null;
        unique_completions: number;
        contribution_percentage: number;
    }[];
}

function formatCurrency(value: number) {
    return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-600 text-white",
    approved: "bg-blue-600 text-white",
    paid: "bg-green-600 text-white",
};

export default function PayoutDetailDialog({
    payoutId,
    open,
    onClose,
}: {
    payoutId: number | null;
    open: boolean;
    onClose: () => void;
}) {
    const [detail, setDetail] = useState<PayoutDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !payoutId) return;
        setLoading(true);
        payoutService
            .getPayoutById(payoutId)
            .then((res) => setDetail(res?.data ?? null))
            .finally(() => setLoading(false));
    }, [open, payoutId]);

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    onClose();
                    setDetail(null);
                }
            }}
        >
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Payout Detail</DialogTitle>
                </DialogHeader>

                {loading || !detail ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-semibold">{detail.teacher?.name}</p>
                                <p className="text-sm text-muted-foreground">{detail.teacher?.email}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {detail.exam_type?.name} -{" "}
                                    {new Date(detail.period_start).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                    })}
                                </p>
                            </div>
                            <Badge className={cn("capitalize border-0 shrink-0", statusStyles[detail.status])}>
                                {detail.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Payout Amount</p>
                                <p className="text-lg font-bold">{formatCurrency(detail.payout_amount)}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Share</p>
                                <p className="text-lg font-bold">{detail.share_percentage.toFixed(2)}%</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Completions</p>
                                <p className="text-lg font-bold">
                                    {detail.teacher_unique_completions}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        /{detail.total_unique_completions}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Calculated from {formatCurrency(detail.revenue_amount)} in amortized subscription
                            revenue for this exam type ({detail.pool_percentage_used}% pool ={" "}
                            {formatCurrency(detail.pool_amount)}).
                        </p>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Breakdown by exam</p>
                            {detail.exams.map((exam) => (
                                <div
                                    key={exam.exam_id}
                                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {exam.exam_name || `Exam #${exam.exam_id}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {exam.unique_completions} unique completions
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="shrink-0">
                                        {exam.contribution_percentage.toFixed(1)}%
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {detail.remark && (
                            <div className="rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Remark</p>
                                <p className="text-sm">{detail.remark}</p>
                            </div>
                        )}

                        {detail.approver && (
                            <p className="text-xs text-muted-foreground">
                                Approved by {detail.approver.name}
                                {detail.approved_at ? ` on ${new Date(detail.approved_at).toLocaleString()}` : ""}
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
