'use client'

import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {toast} from "sonner"
import {Badge} from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useCreateBlog, useDeleteBlog, useGetAllAdminBlogs, useUpdateBlog } from "@/hooks/useBlogs"
import { ReusableDataTable } from "./ReusableDataTable"
import GlobalTableHoverImage from "./GlobalTableHoverImage"
import ActionModal from "../modal/ActionModal"
import { RowActions } from "./action-button"
import { NoDataFound } from "@/lib/helper"
import { BlogFormModal } from "../modal/BlogFormModal"

interface Blog {
    title: string
    slug: string
    content: string
    author: string
    published_date: string
    image: string
    status: "draft" | "published" | "scheduled" | "archived"
}

export default function BlogTable() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)

    const { data, isLoading, isError, error } = useGetAllAdminBlogs({    
        page: currentPage,
        per_page: 10,
        search: searchQuery,
    });

    const blogs = data?.items ?? [];
    const totalPages = data?.total_page ?? 1;
    const totalItems = data?.total_items ?? 0;

    const { mutateAsync: createBlog } = useCreateBlog();
    const { mutateAsync: updateBlog } = useUpdateBlog();
    const { mutate: deleteBlog, isPending: deletePending } = useDeleteBlog();

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const handleAddBlog = useCallback(() => {
        setSelectedBlog(null);
        setFormModalOpen(true)
    }, [])

    const handleEditBlog = useCallback((blog: Blog) => {
        setSelectedBlog(blog);
        setFormModalOpen(true)
    }, [])

    const handleDeleteBlog = useCallback((blog: Blog) => {
        setSelectedBlog(blog);
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteBlog = useCallback(() => {
        if (!selectedBlog) return;

        deleteBlog(selectedBlog.slug, {
        onSuccess: () => {
            setDeleteModalOpen(false);
            setSelectedBlog(null);
        },
        });
    }, [selectedBlog, deleteBlog]);

    const handleFormSubmit = useCallback(
        async (formData: any) => {
            try {
                const data = new FormData();

                Object.keys(formData).forEach((key) => {
                    const value = formData[key];

                    if (value instanceof File) {
                        data.append(key, value);
                    } else if (Array.isArray(value)) {
                        value.forEach((v) => data.append(`${key}[]`, v));
                    } else if (value !== undefined && value !== null) {
                        data.append(key, value);
                    }
                });

                if (selectedBlog) {
                    data.append("_method", "patch");
                    await updateBlog({ slug: selectedBlog.slug, data });
                } else {
                    await createBlog(data);
                }

                setFormModalOpen(false);
                setSelectedBlog(null);
            } catch (error: any) {
                toast.error(error?.message || "Failed to save blog");
            }
        },
        [selectedBlog, createBlog, updateBlog]
    );


    const columns: ColumnDef<Blog>[] = useMemo(() => [
    {
        accessorKey: "image",
        header: "Image",
        size: 100,
        cell: ({ row }) => (
            <GlobalTableHoverImage
                src={row.original.image}
                alt={row.original.title}
                fallbackSrc="/placeholder.png"
            />
        ),
        enableSorting: false,
    },
    {
        accessorKey: "title",
        header: "Title",
        size: 200,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-900">{row.original.title}</span>
                <Badge variant="outline" className="w-fit text-xs">
                    {row.original.slug || "No slug"}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "content",
        header: "Content",
        size: 200,
        cell: ({ row }) => {
            const text = row.original.content.replace(/<[^>]+>/g, ""); 
            return (
            <p className="line-clamp-2 max-w-[300px] text-gray-900 break-words whitespace-normal">
                {text}
            </p>
            );
        }
    },
    {
        accessorKey: "author",
        header: "Author",
        size: 150,
        cell: ({ row }) => <span>{row.original.author}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
            const status = row.original.status;

            const statusColor: Record<string, string> = {
                draft: "bg-gray-200 text-gray-700",
                published: "bg-green-100 text-green-800",
                scheduled: "bg-blue-100 text-blue-800",
                archived: "bg-yellow-100 text-yellow-800",
            };

            return (
                <Badge
                    variant="outline"
                    className={`capitalize ${statusColor[status] || ""}`}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "published_date",
        header: "Published Date",
        size: 150,
        cell: ({ row }) => <span>{row.original.published_date}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => (
            <RowActions
                row={row}
                onViewAction={() => router.push(`/blog/${row.original.slug}`)}
                onEditAction={() => handleEditBlog(row.original)}
                onDeleteAction={() => handleDeleteBlog(row.original)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
], [handleEditBlog, handleDeleteBlog, router]);


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
                        <h3 className="text-sm font-medium text-red-800">Failed to load blogs</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ReusableDataTable<Blog, any>
                data={blogs}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddBlog}
                actionLabel="Add Blog"
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
                searchPlaceholder="Search blogs by name..."
                totalCount={totalItems}
                noDataText={<NoDataFound/>}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Blog"
                description={selectedBlog ? `Are you sure you want to delete "${selectedBlog.title}"? This action cannot be undone.` : "Are you sure you want to delete this blog?"}
                confirmLabel="Delete Blog"
                onConfirm={confirmDeleteBlog}
                loading={deletePending}
            />

            <BlogFormModal
                open={isFormModalOpen}
                onCloseAction={() => {
                    setFormModalOpen(false);
                    setSelectedBlog(null)
                }}
                onSubmitAction={handleFormSubmit}
                slug={selectedBlog?.slug}
                isLoading={false}
            />
        </div>
    )
}
