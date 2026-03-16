'use client'

import { useCallback, useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Shield, Tag, Clock, CreditCard } from "lucide-react"
import { useDeleteSubscription, useSubscriptions } from "@/hooks/useSubscription"
import { useExamTypes } from "@/hooks/useExamTypes"
import { ReusableDataTable } from "./ReusableDataTable"
import ActionModal from "../modal/ActionModal"
import { RowActions } from "./action-button"
import { Badge } from "../ui/badge"
import SelectInputField from "@/components/field/SelectInputField"
import SubscriptionFormDialog from "../modal/SubscriptionFormDialog"
import { currency } from "@/config/app-constant"

interface Subscription {
    id: number
    exam_type_id: number
    duration: number
    price: string
    status: boolean
    exam_type: string
}

export default function SubscriptionTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [examTypeFilter, setExamTypeFilter] = useState<string | number>("")
    const [selectedItem, setSelectedItem] = useState<Subscription | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormOpen, setFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Subscription | null>(null)

    const { mutate: deleteSubscription, isPending: deletePending } = useDeleteSubscription()

    const { data, isLoading, isError, error } = useSubscriptions({
        page: currentPage,
        per_page: 10,
        ...(examTypeFilter ? { exam_type_id: examTypeFilter } : {}),
    })
    console.log("data", data)

    const { data: examTypeData } = useExamTypes({status: 1})
    const examTypes = examTypeData?.data?.data ?? []

    const examTypeOptions = useMemo(() => [
        { label: "All Exam Types", value: "" },
        ...examTypes.map((et: { id: number; name: string }) => ({
            label: et.name,
            value: et.id,
        }))
    ], [examTypes])

    const items: Subscription[] = data?.data?.data ?? []
    const totalPages = data?.data?.last_page ?? 1
    const totalItems = data?.data?.total ?? items.length

    const handleExamTypeFilter = useCallback((val: string | number) => {
        setExamTypeFilter(val)
        setCurrentPage(1)
    }, [])

    const handleAdd = useCallback(() => {
        setEditingItem(null)
        setFormOpen(true)
    }, [])

    const handleEdit = useCallback((item: Subscription) => {
        setEditingItem(item)
        setFormOpen(true)
    }, [])

    const handleDelete = useCallback((item: Subscription) => {
        setSelectedItem(item)
        setDeleteModalOpen(true)
    }, [])

    const confirmDelete = useCallback(() => {
        if (!selectedItem) return
        deleteSubscription(selectedItem.id, {
            onSuccess: () => {
                setDeleteModalOpen(false)
                setSelectedItem(null)
            },
        })
    }, [selectedItem, deleteSubscription])

    const columns: ColumnDef<Subscription>[] = useMemo(() => [
        {
            accessorKey: "exam_type",
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <Tag className="h-4 w-4 text-blue-500" />
                    Exam Type
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">{row.original.exam_type}</span>
            ),
        },
        {
            accessorKey: "duration",
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Duration
                </div>
            ),
            size: 120,
            cell: ({ row }) => (
                <span className="text-gray-700">{row.original.duration} {row.original.duration === 1 ? "month" : "months"}</span>
            ),
        },
        {
            accessorKey: "price",
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    Price
                </div>
            ),
            size: 120,
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900">{currency} {row.original.price}</span>
            ),
        },
        {
            accessorKey: "status",
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <Shield className="h-4 w-4 text-green-500" />
                    Status
                </div>
            ),
            size: 120,
            cell: ({ row }) => (
                <Badge
                    variant="secondary"
                    className={row.original.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                >
                    {row.original.status ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center font-semibold text-gray-700">Actions</div>,
            size: 120,
            cell: ({ row }) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEdit(row.original)}
                    onDeleteAction={() => handleDelete(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleEdit, handleDelete])

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Failed to load subscriptions</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ReusableDataTable<Subscription, any>
                data={items}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAdd}
                actionLabel="Add Plan"
                pagination={{
                    page: currentPage,
                    totalPages,
                    onPageChangeAction: (page) => setCurrentPage(page),
                    dataCount: totalItems,
                }}
                enableRowSelection
                enableSorting
                enableSearch={false}
                enableColumnVisibility
                totalCount={totalItems}
            >
                <SelectInputField
                    placeholder="Filter by exam type"
                    options={examTypeOptions}
                    value={examTypeFilter}
                    onChangeAction={handleExamTypeFilter}
                    className="w-full sm:w-80"
                />
            </ReusableDataTable>

            <SubscriptionFormDialog
                open={isFormOpen}
                onOpenChange={setFormOpen}
                subscription={editingItem}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Subscription Plan"
                description={
                    selectedItem
                        ? `Are you sure you want to delete the ${selectedItem.duration}-month plan for "${selectedItem.exam_type}"? This action cannot be undone.`
                        : "Are you sure you want to delete this plan?"
                }
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                loading={deletePending}
            />
        </div>
    )
}