"use client";

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { doubtService } from "@/service/doubt.service";
import { Check, Circle, MessageSquare, User, Info } from "lucide-react";
import DoubtDialog from "@/components/modal/doubtDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  id: number;
  option: string;
  value: number;
}

interface Doubt {
  id: number;
  status: string;
  doubt: string;
  date: string | null;
  remark: string | null;
  question: {
    question: string;
    explanation: string;
    options: Option[];
  };
  student: {
    name: string;
  };
}

export default function Doubts() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  const fetchDoubts = useCallback(
    async (page: number = 1, size: number = pageSize) => {
      setLoading(true);
      try {
        const res = await doubtService.getAllDoubts({ limit: size }, page);
        const doubtData = res?.data?.data?.data ?? [];
        const total = res?.data?.data?.total ?? 0;
        setDoubts(doubtData);
        setTotalItems(total);
      } catch (err) {
        console.error("Error fetching doubts:", err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchDoubts(currentPage, pageSize);
  }, [currentPage, pageSize, fetchDoubts]);

  const openDoubtModal = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setIsModalOpen(true);
  };

  const closeDoubtModal = () => {
    setSelectedDoubt(null);
    setIsModalOpen(false);
  };

  const columns: ColumnDef<Doubt>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-700">#{getValue<number>()}</span>
      ),
    },
    {
      accessorKey: "student.name",
      header: "Student",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-800">
            {row.original.student?.name ?? "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "doubt",
      header: "Doubt",
      cell: ({ row }) => {
        const doubt = row.original.doubt || "";
        const preview = doubt.length > 80 ? doubt.slice(0, 80) + "..." : doubt;

        return (
          <div className="max-w-[250px] text-sm break-words whitespace-break-spaces">
            <p className="text-gray-700">{preview}</p>

            {doubt.length > 80 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 px-0 font-medium"
                  >
                    View More
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-md whitespace-pre-wrap break-words">
                  <p>{doubt}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "question.question",
      header: "Question",
      cell: ({ row }) => {
        const question = row.original.question?.question || "";
        const preview =
          question.length > 100 ? question.slice(0, 100) + "..." : question;

        return (
          <div className="max-w-[300px] text-sm break-words whitespace-break-spaces">
            <p className="text-gray-700">{preview}</p>

            {question.length > 100 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 px-0 font-medium"
                  >
                    View More
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xl whitespace-pre-wrap break-words">
                  <p>{question}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "question.options",
      header: "Options",
      enableSorting: false,
      cell: ({ row }) => {
        const options = row.original.question?.options || [];

        return (
          <ul className="space-y-1 max-w-[250px] break-words">
            {options.map((opt) => (
              <li
                key={opt.id}
                className={`flex items-start gap-2 text-sm px-2 py-1 rounded-md border break-words ${
                  opt.value === 1
                    ? "bg-green-50 border-green-200 text-green-700 font-medium"
                    : "bg-gray-50 border-gray-100 text-gray-700"
                }`}
              >
                {opt.value === 1 ? (
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-[2px]" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 shrink-0 mt-[2px]" />
                )}
                <span className="whitespace-pre-wrap break-words">
                  {opt.option}
                </span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "question.explanation",
      header: "Explanation",
      cell: ({ row }) => {
        const explanation = row.original.question?.explanation || "";
        const preview =
          explanation.length > 100
            ? explanation.slice(0, 100) + "..."
            : explanation;

        return (
          <div className="max-w-[250px] break-words whitespace-break-spaces text-sm">
            <p className="text-gray-700">{preview}</p>

            {explanation.length > 100 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 px-0 font-medium"
                  >
                    View More
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xl whitespace-pre-wrap break-words">
                  <p>{explanation}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        if (!val) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-gray-700 text-sm">
            {format(new Date(val), "dd MMM yyyy, hh:mm a")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const isResolved = status === "Resolved";
        return (
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              isResolved
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "remark",
      header: "Remark",
      enableSorting: false,
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val ? (
          <div className="max-w-[200px] text-gray-700 text-sm">{val}</div>
        ) : (
          <span className="text-gray-400 font-bold">—</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant={row.original.status === "Resolved" ? "secondary" : "default"}
          className={`text-sm ${
            row.original.status === "Resolved"
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={() => openDoubtModal(row.original)}
          disabled={row.original.status === "Resolved"}
        >
          {row.original.status === "Resolved" ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Resolved
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-1" /> Resolve
            </>
          )}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Info className="h-6 w-6 text-blue-600" />
          Doubts Management
        </h1>
      </div>

      <ReusableDataTable
        columns={columns}
        data={doubts}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        loading={loading}
        onPageChangeAction={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => setPageSize(size)}
        enableSearch={false}
      />

      <DoubtDialog
        doubt={selectedDoubt}
        isOpen={isModalOpen}
        onClose={closeDoubtModal}
        onSuccess={() => fetchDoubts(currentPage, pageSize)}
      />
    </div>
  );
}
