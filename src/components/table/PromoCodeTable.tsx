"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PromoCodeFormDialog from "../modal/PromoCodeFormDialog";
import ActionModal from "../modal/ActionModal";
import { RowActions } from "./action-button";
import { ReusableDataTable } from "./ReusableDataTable";
import {
  useDeletePromoCode,
  useGetPromoCodes,
} from "@/hooks/use-payment-settings";

interface PromoCode {
  id: number;
  code: string;
  discount_percent: string;
  detail: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}

export default function PromoCodeTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PromoCode | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoCode | null>(null);

  const { mutate: deletePromoCode, isPending: deletePending } =
    useDeletePromoCode();
  const { data, isLoading, isError, error } = useGetPromoCodes({
    page: currentPage,
    per_page: 10,
    search: searchQuery,
  });

  const items: PromoCode[] = data?.data?.items ?? [];
  const totalPages = data?.data?.total_page ?? 1;
  const totalItems = data?.data?.total_items ?? items.length;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: PromoCode) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((item: PromoCode) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!selectedItem) return;
    deletePromoCode(String(selectedItem.id), {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedItem(null);
      },
    });
  }, [selectedItem, deletePromoCode]);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const columns: ColumnDef<PromoCode>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: () => (
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <Tag className="h-4 w-4 text-blue-500" />
            Code
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "discount_percent",
        header: () => (
          <div className="font-semibold text-gray-700">Discount</div>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {Number(row.original.discount_percent)}%
          </span>
        ),
      },
      {
        accessorKey: "detail",
        header: () => <div className="font-semibold text-gray-700">Detail</div>,
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.detail}</span>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="font-semibold text-gray-700">Status</div>,
        cell: ({ row }) => (
          <Badge
            className={
              row.original.status
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-100"
            }
          >
            {row.original.status ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="text-center font-semibold text-gray-700">Actions</div>
        ),
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
    ],
    [handleEdit, handleDelete],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Failed to load promo codes
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReusableDataTable<PromoCode, any>
        data={items}
        columns={columns}
        loading={isLoading}
        onAddAction={handleAdd}
        actionLabel="Add Promo Code"
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
        searchPlaceholder="Search by code"
        totalCount={totalItems}
      />

      <PromoCodeFormDialog
        open={isFormOpen}
        onOpenChange={setFormOpen}
        promoCode={editingItem}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Promo Code"
        description={
          selectedItem
            ? `Are you sure you want to delete "${selectedItem.code}"? This action cannot be undone.`
            : "Are you sure you want to delete this entry?"
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deletePending}
      />
    </div>
  );
}
