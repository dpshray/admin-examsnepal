"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import SelectInputField from "@/components/field/SelectInputField";
import ActionModal from "@/components/modal/ActionModal";
import { instituteService } from "@/service/institute.service";
import { toast } from "sonner";
import { Ban, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Institute {
    id: number;
    name: string;
    fullname: string;
    username: string;
    email: string;
    phone: string | null;
    slug: string | null;
    registered_at: string | null;
    is_disabled: boolean;
    disabled_at: string | null;
    classes_count: number;
    students_enrolled: number;
    external_exams_count: number;
    app_exams_count: number;
}

function formatDate(value: string | null) {
    if (!value) return "—";
    const date = new Date(value.replace(" ", "T"));
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "disabled", label: "Disabled" },
];

export function InstitutesTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [toggleTarget, setToggleTarget] = useState<Institute | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-institutes", currentPage, searchQuery, statusFilter],
        queryFn: async () => {
            const res = await instituteService.getAllInstitutes({
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

    const handleToggle = async () => {
        if (!toggleTarget) return;
        setActionLoading(true);
        try {
            await instituteService.toggleStatus(toggleTarget.id);
            toast.success(toggleTarget.is_disabled ? "Account enabled." : "Account disabled.");
            setToggleTarget(null);
            queryClient.invalidateQueries({ queryKey: ["admin-institutes"] });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update account status.");
        } finally {
            setActionLoading(false);
        }
    };

    const columns: ColumnDef<Institute>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                size: 240,
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.original.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{row.original.email}</p>
                    </div>
                ),
            },
            {
                accessorKey: "registered_at",
                header: "Registered",
                size: 130,
                cell: ({ row }) => <span className="text-sm">{formatDate(row.original.registered_at)}</span>,
            },
            {
                accessorKey: "classes_count",
                header: "Classes",
                size: 90,
                cell: ({ row }) => <span className="text-sm">{row.original.classes_count}</span>,
            },
            {
                accessorKey: "students_enrolled",
                header: "Students Enrolled",
                size: 130,
                cell: ({ row }) => <span className="text-sm">{row.original.students_enrolled}</span>,
            },
            {
                accessorKey: "external_exams_count",
                header: "External Exams",
                size: 120,
                cell: ({ row }) => <span className="text-sm">{row.original.external_exams_count}</span>,
            },
            {
                accessorKey: "app_exams_count",
                header: "Examsnepal App Exams",
                size: 150,
                cell: ({ row }) => <span className="text-sm">{row.original.app_exams_count}</span>,
            },
            {
                accessorKey: "is_disabled",
                header: "Status",
                size: 100,
                cell: ({ row }) => (
                    <Badge
                        className={cn(
                            "border-0",
                            row.original.is_disabled ? "bg-red-600 text-white" : "bg-green-600 text-white"
                        )}
                    >
                        {row.original.is_disabled ? "Disabled" : "Active"}
                    </Badge>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                size: 120,
                cell: ({ row }) =>
                    row.original.is_disabled ? (
                        <Button variant="outline" size="sm" onClick={() => setToggleTarget(row.original)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Enable
                        </Button>
                    ) : (
                        <Button variant="destructive" size="sm" onClick={() => setToggleTarget(row.original)}>
                            <Ban className="h-4 w-4 mr-1" />
                            Disable
                        </Button>
                    ),
            },
        ],
        []
    );

    const institutes = data?.data ?? [];
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
                data={institutes}
                columns={columns}
                loading={isLoading}
                enableSearch
                enableSorting
                enableRowSelection={false}
                searchPlaceholder="Search by name, email or organization..."
                onSearchAction={handleSearchChange}
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize: institutes.length,
                    onPageChangeAction: setCurrentPage,
                    dataCount: totalCount,
                }}
            />

            <ActionModal
                open={!!toggleTarget}
                setOpen={(open) => !open && setToggleTarget(null)}
                title={toggleTarget?.is_disabled ? "Enable Account" : "Disable Account"}
                description={
                    toggleTarget?.is_disabled
                        ? `Enable ${toggleTarget?.name}? They will be able to log in again and their classes will be listed on the website.`
                        : `Disable ${toggleTarget?.name}? They will be logged out, unable to log in, and hidden from the classes page on the website.`
                }
                confirmLabel={toggleTarget?.is_disabled ? "Enable" : "Disable"}
                confirmVariant={toggleTarget?.is_disabled ? "default" : "destructive"}
                loading={actionLoading}
                onConfirm={handleToggle}
            />
        </>
    );
}
