"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SendNotificationPayload } from "@/service/notification.service";
import { ReusableDataTable } from "./ReusableDataTable";
import { RowActions } from "./action-button";
import ActionModal from "../modal/ActionModal";
import { NoDataFound } from "@/lib/helper";
import {
  useDeleteNotification,
  useNotifications,
  useSendNotification,
} from "@/hooks/use-notification";
import { NotificationFormModal } from "../modal/NotificationFormModal";
import { formatDate, formatTime, parseApiDate } from "@/lib/utils";

type NotificationType = "NEW_EXAM" | "BULK_NOTIFICATION" | (string & {});

interface NotificationExam {
  exam_name: string;
  exam_type_id: number;
  exam_category: string;
}

interface NotificationItem {
  notification_id: number;
  title: string;
  body: string;
  type: NotificationType;
  exam: NotificationExam | null;
  notified_at: string;
}

const humanize = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "-";

export default function NotificationTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useNotifications({
    page: currentPage,
    per_page: 10,
    search: searchQuery,
  } as any);

  const notifications: NotificationItem[] = data?.items ?? [];
  const totalPages: number = data?.total_page ?? 1;
  const totalItems: number = data?.total_items ?? 0;

  const { mutateAsync: sendNotification, isPending: sending } =
    useSendNotification();
  const { mutate: deleteNotification, isPending: deletePending } =
    useDeleteNotification();

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const handleDelete = useCallback((item: NotificationItem) => {
    setSelected(item);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!selected) return;
    deleteNotification(selected.notification_id, {
      onSuccess: () => {
        toast.success("Notification deleted");
        setDeleteModalOpen(false);
        setSelected(null);
      },
      onError: (err: any) =>
        toast.error(err?.message || "Failed to delete notification"),
    });
  }, [selected, deleteNotification]);

  const handleSend = useCallback(
    async (payload: SendNotificationPayload) => {
      try {
        await sendNotification(payload);
        toast.success("Notification sent");
        setFormModalOpen(false);
      } catch (err: any) {
        toast.error(err?.message || "Failed to send notification");
        throw err;
      }
    },
    [sendNotification],
  );

  const columns: ColumnDef<NotificationItem>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "body",
        header: "Description",
        size: 300,
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-87.5 whitespace-normal wrap-break-word text-gray-900">
            {row.original.body}
          </p>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 150,
        cell: ({ row }) => (
          <Badge
            variant={row.original.type === "NEW_EXAM" ? "default" : "outline"}
          >
            {humanize(row.original.type)}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        id: "exam",
        header: "Exam",
        size: 200,
        cell: ({ row }) => {
          const exam = row.original.exam;
          if (!exam) return <span className="text-gray-500">-</span>;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-900">
                {exam.exam_name}
              </span>
              <Badge variant="outline" className="w-fit">
                {humanize(exam.exam_category)}
              </Badge>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "notified_at",
        header: "Sent At",
        size: 160,
        cell: ({ row }) => {
          const date = parseApiDate(row.original.notified_at);
          if (!date) return <span>-</span>;
          return (
            <div className="flex flex-col">
              <span className="text-gray-900">{formatDate(date)}</span>
              <span className="text-xs text-gray-500">{formatTime(date)}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => (
          <RowActions
            row={row}
            onDeleteAction={() => handleDelete(row.original)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleDelete],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">
            Failed to load notifications
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {(error as Error)?.message || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReusableDataTable<NotificationItem, any>
        data={notifications}
        columns={columns}
        loading={isLoading}
        onAddAction={() => setFormModalOpen(true)}
        actionLabel="Send Notification"
        pagination={{
          page: currentPage,
          totalPages,
          onPageChangeAction: handlePageChange,
          dataCount: totalItems,
        }}
        onSearchAction={handleSearch}
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search notifications..."
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Notification"
        description={
          selected
            ? `Are you sure you want to delete "${selected.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this notification?"
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deletePending}
      />

      <NotificationFormModal
        open={isFormModalOpen}
        onCloseAction={() => setFormModalOpen(false)}
        onSubmitAction={handleSend}
        isLoading={sending}
      />
    </div>
  );
}
