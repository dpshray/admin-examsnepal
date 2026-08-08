"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import SelectInputField from "@/components/field/SelectInputField";
import { payoutService } from "@/service/payout.service";
import { toast } from "sonner";
import { Check, Eye, RotateCcw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import PayoutActionDialog from "@/components/modal/PayoutActionDialog";
import PayoutDetailDialog from "@/components/modal/PayoutDetailDialog";
import ActionModal from "@/components/modal/ActionModal";

interface Payout {
    id: number;
    teacher: { id: number; name: string; email: string } | null;
    exam_type: { id: number; name: string } | null;
    period_start: string;
    period_end: string;
    teacher_unique_completions: number;
    total_unique_completions: number;
    share_percentage: number;
    payout_amount: number;
    status: "pending" | "approved" | "paid";
    paid_at: string | null;
}

function formatCurrency(value: number) {
    return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPeriod(start: string) {
    return new Date(start).toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-600 text-white",
    approved: "bg-blue-600 text-white",
    paid: "bg-green-600 text-white",
};

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "paid", label: "Paid" },
];

export function PayoutsTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [detailId, setDetailId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [approveTarget, setApproveTarget] = useState<Payout | null>(null);
    const [payTarget, setPayTarget] = useState<Payout | null>(null);
    const [revertTarget, setRevertTarget] = useState<Payout | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-payouts", currentPage, searchQuery, statusFilter],
        queryFn: async () => {
            const res = await payoutService.getAllPayouts({
                page: currentPage,
                search: searchQuery,
                status: statusFilter === "all" ? undefined : statusFilter,
            });
            return {
                data: res?.data?.data ?? [],
                current_page: res?.data?.current_page ?? 1,
                last_page: res?.data?.last_page ?? 1,
                total: res?.data?.total ?? 0,
            };
        },
    });

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleStatusChange = useCallback((value: string | number) => {
        setStatusFilter(String(value));
        setCurrentPage(1);
    }, []);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    }, [queryClient]);

    const handleApprove = async (remark: string) => {
        if (!approveTarget) return;
        setActionLoading(true);
        try {
            await payoutService.approvePayout(approveTarget.id, remark || undefined);
            toast.success("Payout approved.");
            setApproveTarget(null);
            invalidate();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve payout.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkPaid = async (remark: string) => {
        if (!payTarget) return;
        setActionLoading(true);
        try {
            await payoutService.markPayoutPaid(payTarget.id, remark || undefined);
            toast.success("Payout marked as paid.");
            setPayTarget(null);
            invalidate();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to mark payout as paid.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevert = async () => {
        if (!revertTarget) return;
        setActionLoading(true);
        try {
            await payoutService.revertPayout(revertTarget.id);
            toast.success("Payout reverted to pending.");
            setRevertTarget(null);
            invalidate();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to revert payout.");
        } finally {
            setActionLoading(false);
        }
    };

    const columns: ColumnDef<Payout>[] = useMemo(
        () => [
            {
                accessorKey: "teacher",
                header: "Teacher",
                size: 220,
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.original.teacher?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{row.original.teacher?.email}</p>
                    </div>
                ),
            },
            {
                accessorKey: "exam_type",
                header: "Exam Type",
                size: 180,
                cell: ({ row }) => <span className="text-sm">{row.original.exam_type?.name || "—"}</span>,
            },
            {
                accessorKey: "period_start",
                header: "Period",
                size: 140,
                cell: ({ row }) => <span className="text-sm">{formatPeriod(row.original.period_start)}</span>,
            },
            {
                accessorKey: "share_percentage",
                header: "Share",
                size: 160,
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.teacher_unique_completions}/{row.original.total_unique_completions} (
                        {row.original.share_percentage.toFixed(1)}%)
                    </span>
                ),
            },
            {
                accessorKey: "payout_amount",
                header: "Amount",
                size: 140,
                cell: ({ row }) => (
                    <Badge variant="secondary" className="font-semibold">
                        {formatCurrency(row.original.payout_amount)}
                    </Badge>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 110,
                cell: ({ row }) => (
                    <Badge className={cn("capitalize border-0", statusStyles[row.original.status])}>
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                size: 220,
                cell: ({ row }) => {
                    const payout = row.original;
                    return (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setDetailId(payout.id);
                                    setDetailOpen(true);
                                }}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            {payout.status === "pending" && (
                                <Button variant="default" size="sm" onClick={() => setApproveTarget(payout)}>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                            )}
                            {payout.status === "approved" && (
                                <>
                                    <Button variant="default" size="sm" onClick={() => setPayTarget(payout)}>
                                        <Wallet className="h-4 w-4 mr-1" />
                                        Mark Paid
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setRevertTarget(payout)}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                },
            },
        ],
        []
    );

    const payouts = data?.data ?? [];
    const totalPages = data?.last_page ?? 1;
    const totalCount = data?.total ?? 0;

    return (
        <>
            <div className="mb-4 max-w-xs">
                <SelectInputField
                    placeholder="Filter by status"
                    options={statusOptions}
                    onChangeAction={handleStatusChange}
                    value={statusFilter}
                />
            </div>

            <ReusableDataTable
                data={payouts}
                columns={columns}
                loading={isLoading}
                enableSearch
                enableSorting
                enableRowSelection={false}
                searchPlaceholder="Search by teacher name or email..."
                onSearchAction={handleSearchChange}
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize: payouts.length,
                    onPageChangeAction: setCurrentPage,
                    dataCount: totalCount,
                }}
            />

            <PayoutDetailDialog
                payoutId={detailId}
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailId(null);
                }}
            />

            <PayoutActionDialog
                open={!!approveTarget}
                setOpen={(open) => !open && setApproveTarget(null)}
                title="Approve Payout"
                description={`Approve ${formatCurrency(approveTarget?.payout_amount ?? 0)} for ${approveTarget?.teacher?.name}? This does not send money - it marks the payout ready to be paid.`}
                confirmLabel="Approve"
                loading={actionLoading}
                onConfirm={handleApprove}
            />

            <PayoutActionDialog
                open={!!payTarget}
                setOpen={(open) => !open && setPayTarget(null)}
                title="Mark as Paid"
                description={`Confirm you've actually paid ${formatCurrency(payTarget?.payout_amount ?? 0)} to ${payTarget?.teacher?.name} outside this system.`}
                confirmLabel="Mark as Paid"
                loading={actionLoading}
                onConfirm={handleMarkPaid}
            />

            <ActionModal
                open={!!revertTarget}
                setOpen={(open) => !open && setRevertTarget(null)}
                title="Revert to Pending"
                description={`Undo the approval for ${revertTarget?.teacher?.name}'s ${formatCurrency(revertTarget?.payout_amount ?? 0)} payout? It will go back to pending.`}
                confirmLabel="Revert"
                confirmVariant="outline"
                loading={actionLoading}
                onConfirm={handleRevert}
            />
        </>
    );
}
