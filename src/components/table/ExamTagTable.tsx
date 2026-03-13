'use client'

import { useCallback, useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Tag } from "lucide-react"
import ExamTagFormDialog from "../modal/ExamTagFormDialog"
import { useExamTags, useDeleteExamTag } from "@/hooks/useExamTags"
import { ReusableDataTable } from "./ReusableDataTable"
import ActionModal from "../modal/ActionModal"
import { RowActions } from "./action-button"

interface ExamTag {
    id: number
    name: string
    slug: string
}

export default function ExamTagTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedItem, setSelectedItem] = useState<ExamTag | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormOpen, setFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ExamTag | null>(null)

    const { mutate: deleteExamTag, isPending: deletePending } = useDeleteExamTag()
    const { data, isLoading, isError, error } = useExamTags({
        page: currentPage,
        per_page: 10,
        search: searchQuery,
    })

    const items = data?.data?.data ?? []
    const totalPages = data?.data?.last_page ?? 1
    const totalItems = data?.data?.total ?? items.length

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handleAdd = useCallback(() => {
        setEditingItem(null)
        setFormOpen(true)
    }, [])

    const handleEdit = useCallback((item: ExamTag) => {
        setEditingItem(item)
        setFormOpen(true)
    }, [])

    const handleDelete = useCallback((item: ExamTag) => {
        setSelectedItem(item)
        setDeleteModalOpen(true)
    }, [])

    const confirmDelete = useCallback(() => {
        if (!selectedItem) return
        deleteExamTag(selectedItem.slug, {
            onSuccess: () => {
                setDeleteModalOpen(false)
                setSelectedItem(null)
            },
        })
    }, [selectedItem, deleteExamTag])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const columns: ColumnDef<ExamTag>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <Tag className="h-4 w-4 text-blue-500" />
                    Name
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "slug",
            header: () => (
                <div className="font-semibold text-gray-700">Slug</div>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-gray-500">{row.original.slug}</span>
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
                        <h3 className="text-sm font-medium text-red-800">Failed to load exam tags</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ReusableDataTable<ExamTag, any>
                data={items}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAdd}
                actionLabel="Add Exam Tag"
                pagination={{
                    page: currentPage,
                    totalPages,
                    onPageChangeAction: handlePageChange,
                    dataCount: totalItems,
                }}
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search by name"
                totalCount={totalItems}
            />

            <ExamTagFormDialog
                open={isFormOpen}
                onOpenChange={setFormOpen}
                examTag={editingItem}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Exam Tag"
                description={
                    selectedItem
                        ? `Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this entry?"
                }
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                loading={deletePending}
            />
        </div>
    )
}