'use client'

import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound} from "@/lib/helper"
import {toast} from "sonner"
import {Badge} from "@/components/ui/badge"
import { useCreateBlogCategory, useDeleteBlogCategory, useGetAllBlogCategories, useUpdateBlogCategory } from "@/hooks/useBlogCategory"
import { RowActions } from "./action-button"
import { ReusableDataTable } from "./ReusableDataTable"
import ActionModal from "../modal/ActionModal"
import { CategoryFormModal } from "../modal/CategoryFormModal"

interface Category {
    title: string
    slug: string
    description: string
    author: string
    published_date: string
    image: string
}

export default function CategoryTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)

    const { data, isLoading, isError, error } = useGetAllBlogCategories({    
        page: currentPage,
        per_page: 10,
        search: searchQuery,
    });

    const categories = data?.items ?? [];
    const totalPages = data?.total_page ?? 1;
    const totalItems = data?.total_items ?? 0;

    const { mutateAsync: createCategory } = useCreateBlogCategory();
    const { mutateAsync: updateCategory } = useUpdateBlogCategory();
    const { mutate: deleteCategory, isPending: deletePending } = useDeleteBlogCategory();

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const handleAddCategory = useCallback(() => {
        setSelectedCategory(null);
        setFormModalOpen(true)
    }, [])

    const handleEditCategory = useCallback((category: Category) => {
        setSelectedCategory(category);
        setFormModalOpen(true)
    }, [])

    const handleDeleteCategory = useCallback((category: Category) => {
        setSelectedCategory(category);
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteCategory = useCallback(() => {
        if (!selectedCategory) return;

        deleteCategory(selectedCategory.slug, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedCategory(null);
            },
        });
    }, [selectedCategory, deleteCategory]);

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

                if (selectedCategory) {
                    data.append("_method", "patch");
                    await updateCategory({ slug: selectedCategory.slug, data });
                } else {
                    await createCategory(data);
                }

                setFormModalOpen(false);
                setSelectedCategory(null);
            } catch (error: any) {
                toast.error(error?.message || "Failed to save category");
            }
        },
        [selectedCategory, createCategory, updateCategory]
    );


    const columns: ColumnDef<Category>[] = useMemo(() => [
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
                aria-label={`Select category ${row.original.title}`}
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
                onEditAction={() => handleEditCategory(row.original)}
                onDeleteAction={() => handleDeleteCategory(row.original)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
], [handleEditCategory, handleDeleteCategory]);


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
            <ReusableDataTable<Category, any>
                data={categories}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddCategory}
                actionLabel="Add Category"
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
                title="Delete Category"
                description={selectedCategory ? `Are you sure you want to delete "${selectedCategory.title}"? This action cannot be undone.` : "Are you sure you want to delete this category?"}
                confirmLabel="Delete Category"
                onConfirm={confirmDeleteCategory}
                loading={deletePending}
            />

            <CategoryFormModal
                open={isFormModalOpen}
                onCloseAction={() => {
                    setFormModalOpen(false);
                    setSelectedCategory(null)
                }}
                onSubmitAction={handleFormSubmit}
                slug={selectedCategory?.slug}
                isLoading={false}
            />
        </div>
    )
}
