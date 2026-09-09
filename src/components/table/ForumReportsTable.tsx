"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ActionModal from "../modal/ActionModal";
import { RowActions } from "./action-button";
import { ReusableDataTable } from "./ReusableDataTable";
import {
  useDeleteForumReportContent,
  useGetAllForumReports,
} from "@/hooks/use-forum";

interface ForumReportUser {
  id: number;
  name: string;
  email: string;
}

interface ForumQuestion {
  id: number;
  question: string;
  deleted: number;
  created_at: string | null;
}

interface ForumAnswer {
  id: number;
  forum_question_id: number;
  answer: string;
  created_at: string | null;
  is_deleted: number;
}

interface ForumReport {
  id: number;
  question: ForumQuestion;
  answer: ForumAnswer | null;
  user: ForumReportUser;
  reason: string;
  report_type: string;
}

export default function ForumReportsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ForumReport | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetAllForumReports({
    page: currentPage,
    per_page: 10,
  });

  const { mutate: deleteForumReportContent, isPending: deletePending } =
    useDeleteForumReportContent();

  const items: ForumReport[] = data?.items ?? [];
  const totalPages = data?.total_page ?? 1;
  const totalItems = data?.total_items ?? items.length;

  const handleDelete = useCallback((item: ForumReport) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!selectedItem) return;
    deleteForumReportContent(selectedItem.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedItem(null);
      },
    });
  }, [selectedItem, deleteForumReportContent]);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const isContentDeleted = (item: ForumReport) =>
    item.answer ? item.answer.is_deleted === 1 : item.question?.deleted === 1;

  const columns: ColumnDef<ForumReport>[] = useMemo(
    () => [
      {
        id: "content",
        header: () => (
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <Flag className="h-4 w-4 text-red-500" />
            Reported Content
          </div>
        ),
        cell: ({ row }) => {
          const isAnswer = !!row.original.answer;
          const text = isAnswer
            ? row.original.answer?.answer
            : row.original.question?.question;
          return (
            <span className="line-clamp-2 max-w-xs text-sm text-gray-900">
              {text}
            </span>
          );
        },
      },
      {
        accessorKey: "report_type",
        header: () => <div className="font-semibold text-gray-700">Type</div>,
        cell: ({ row }) => (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 capitalize">
            {row.original.answer ? "Answer" : "Question"}
          </Badge>
        ),
      },
      {
        id: "reported_by",
        header: () => (
          <div className="font-semibold text-gray-700">Reported By</div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {row.original.user?.name}
            </span>
            <span className="text-xs text-gray-500">
              {row.original.user?.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: () => <div className="font-semibold text-gray-700">Reason</div>,
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.reason}</span>
        ),
      },
      {
        id: "status",
        header: () => <div className="font-semibold text-gray-700">Status</div>,
        cell: ({ row }) => {
          const deleted = isContentDeleted(row.original);
          return deleted ? (
            <Badge className="flex w-fit items-center gap-1 bg-red-100 text-red-700 hover:bg-red-100">
              <XCircle className="h-3.5 w-3.5" />
              Content Deleted
            </Badge>
          ) : (
            <Badge className="flex w-fit items-center gap-1 bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </Badge>
          );
        },
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
              Failed to load forum reports
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
      <ReusableDataTable<ForumReport, any>
        data={items}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChangeAction: handlePageChange,
          dataCount: totalItems,
        }}
        enableRowSelection
        enableSorting
        enableSearch={false}
        totalCount={totalItems}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Reported Content"
        description={
          selectedItem
            ? `This will permanently delete the reported ${
                selectedItem.answer ? "answer" : "question"
              }, not the report itself. This action cannot be undone.`
            : "This will permanently delete the reported content, not the report itself. This action cannot be undone."
        }
        confirmLabel="Delete Content"
        onConfirm={confirmDelete}
        loading={deletePending}
      />
    </div>
  );
}
