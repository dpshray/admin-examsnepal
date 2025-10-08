"use client"

import { useCallback, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableDataTable } from "@/components/table/ReusableDataTable"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { doubtService } from "@/service/doubt.service"
import { Check, Circle } from "lucide-react"
import DoubtDialog from "@/components/modal/doubtDialog"

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
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
    // const [searchTerm, setSearchTerm] = useState("")

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
        fetchDoubts(currentPage, pageSize)
    }, [currentPage, pageSize, fetchDoubts])

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
    },
    {
      accessorKey: "student.name",
      header: "Student",
      cell: ({ row }) => <div>{row.original.student?.name ?? "-"}</div>,
    },
    {
      accessorKey: "doubt",
      header: "Doubt",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="max-w-[250px] max-h-[200px] overflow-y-auto break-words whitespace-normal">
          {row.original.doubt}
        </div>
      ),
    },
    {
        accessorKey: "question.question",
        header: "Question",
        enableSorting: false,
        cell: ({ row }) => (
            <div className="max-w-[350px] max-h-[200px] overflow-y-auto break-words whitespace-normal">
            {row.original.question?.question}
            </div>
        ),
    },
    {
      accessorKey: "question.options",
      header: "Options",
      enableSorting: false,
      cell: ({ row }) => {
        const options = row.original.question?.options || [];
        return (
          <ul className="space-y-1 max-w-[200px] break-words whitespace-normal">
            {options.map((opt) => (
              <li
                key={opt.id}
                className={`flex items-start gap-2 ${
                  opt.value === 1 ? "text-green-700 font-semibold" : "text-gray-700"
                }`}
              >
                <span>{opt.value === 1 ? <Check className="h-4 w-4"/> : <Circle className="h-4 w-4"/>}</span>
                <span>{opt.option}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
        accessorKey: "question.explanation",
        header: "Explanation",
        enableSorting: false,
        cell: ({ row }) => (
            <div
            className="max-w-[300px] max-h-[200px] overflow-y-auto border rounded-md p-2 bg-gray-50 text-sm text-gray-800"
            dangerouslySetInnerHTML={{
                __html: row.original.question?.explanation || "-",
            }}
            />
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => {
            const val = getValue<string | null>();
            if (!val) return <div className="text-center text-3xl">-</div>;
            return format(new Date(val), "dd MMM yyyy, hh:mm a");
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue<string>();
            return (
                <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                    status === "Resolved"
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
            <div className="max-w-[200px] break-words whitespace-normal">{val}</div> 
            ) : (
            <div className="text-center text-3xl">-</div> 
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button
                variant="green"
                onClick={() => openDoubtModal(row.original)}
                disabled={row.original.status === "Resolved"}
            >
            {row.original.status === "Resolved" ? "Resolved" : "Resolve Doubt"}
            </Button>
        ),
    },
    ]

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Doubts</h1>
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
                // onSearchAction={(val) => {
                //     setSearchTerm(val)
                //     if (val !== searchTerm) setCurrentPage(1)
                // }}
                // searchPlaceholder="Search doubt by email..."
            />

            <DoubtDialog
                doubt={selectedDoubt}
                isOpen={isModalOpen}
                onClose={closeDoubtModal}
                onSuccess={() => fetchDoubts(currentPage, pageSize)}
            />
        </div>
    )
}
