'use client'

import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound} from "@/lib/helper"
import {toast} from "sonner"
import {Badge} from "@/components/ui/badge"
import { useCreateBlogTag, useDeleteBlogTag, useGetAllBlogTags, useUpdateBlogTag } from "@/hooks/useBlogTag"
import { RowActions } from "./action-button"
import { ReusableDataTable } from "./ReusableDataTable"
import ActionModal from "../modal/ActionModal"
import { TagFormModal } from "../modal/TagFormModal"

interface Tag {
    title: string
    slug: string
    description: string
    author: string
    published_date: string
    image: string
}

export default function BlogTagTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)

    const { data, isLoading, isError, error } = useGetAllBlogTags({    
        page: currentPage,
        per_page: 10,
        search: searchQuery,
    });

    const categories = data?.items ?? [];
    const totalPages = data?.total_page ?? 1;
    const totalItems = data?.total_items ?? 0;

    const { mutateAsync: createTag } = useCreateBlogTag();
    const { mutateAsync: updateTag } = useUpdateBlogTag();
    const { mutate: deleteTag, isPending: deletePending } = useDeleteBlogTag();

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const handleAddTag = useCallback(() => {
        setSelectedTag(null);
        setFormModalOpen(true)
    }, [])

    const handleEditTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setFormModalOpen(true)
    }, [])

    const handleDeleteTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteTag = useCallback(() => {
        if (!selectedTag) return;

        deleteTag(selectedTag.slug, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedTag(null);
            },
        });
    }, [selectedTag, deleteTag]);

    const handleFormSubmit = useCallback(
        async (formData: any) => {
            try {
                const data = new FormData();

                Object.keys(formData).forEach((key) => {
                    const value = formData[key];

                    if (value instanceof File) {
                        data.append(key, value);
                    } else if (value !== undefined && value !== null) {
                        data.append(key, value);
                    }
                });

                if (selectedTag) {
                    data.append("_method", "patch");
                    await updateTag({ slug: selectedTag.slug, data });
                } else {
                    await createTag(data);
                }

                setFormModalOpen(false);
                setSelectedTag(null);
            } catch (error: any) {
                toast.error(error?.message || "Failed to save tag");
            }
        },
        [selectedTag, createTag, updateTag]
    );


    const columns: ColumnDef<Tag>[] = useMemo(() => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all categories"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label={`Select tag ${row.original.title}`}
                className="mx-auto"
            />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: "Title",
        size: 200,
        cell: ({ row }) => (
            <span className="font-medium text-gray-900">{row.original.title}</span>
        ),
    },
    {
        accessorKey: "slug",
        header: "Slug",
        size: 200,
        cell: ({ row }) => (
            <Badge variant="outline" className="w-fit text-xs">
                {row.original.slug || "No slug"}
            </Badge>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => (
            <RowActions
                row={row}
                onEditAction={() => handleEditTag(row.original)}
                onDeleteAction={() => handleDeleteTag(row.original)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
], [handleEditTag, handleDeleteTag]);


    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"/>
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Failed to load categories</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ReusableDataTable<Tag, any>
                data={categories}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddTag}
                actionLabel="Add Tag"
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
                searchPlaceholder="Search categories by title..."
                totalCount={totalItems}
                noDataText={<NoDataFound/>}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Tag"
                description={selectedTag ? `Are you sure you want to delete "${selectedTag.title}"? This action cannot be undone.` : "Are you sure you want to delete this tag?"}
                confirmLabel="Delete Tag"
                onConfirm={confirmDeleteTag}
                loading={deletePending}
            />

            <TagFormModal
                open={isFormModalOpen}
                onCloseAction={() => {
                    setFormModalOpen(false);
                    setSelectedTag(null)
                }}
                onSubmitAction={handleFormSubmit}
                slug={selectedTag?.slug}
                isLoading={false}
            />
        </div>
    )
}
