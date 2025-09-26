'use client';

import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import { examService } from "@/service/exam.service";
import { studentService } from "@/service/student.service";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";

interface Subscription {
    id: number;
    student_name: string;
    student_email: string;
    exam_name: string;
    exam_type: string;
    exam_category: string;
    score: number | null;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [examTypes, setExamTypes] = useState<{ value: string; label: string }[]>([])
    const [selectedExamType, setSelectedExamType] = useState<string>("");
    const [selectedExamCategory, setSelectedExamCategory] = useState<string>("");
    const examCategories = [
        { value: 3, label: "Free Quiz" },
        { value: 4, label: "Sprint Quiz" },
        { value: 1, label: "Mock Tests" },
    ];

    const getSubmissions = useCallback(
        async (page: number = 1, size: number = pageSize, search: string = searchTerm, examType: string = selectedExamType, exam_category: string = selectedExamCategory) => {
            setLoading(true);
            try {
                const params: any = { limit: size, search };
                if (examType && examType !== "all") {
                    params.exam_type = Number(examType);
                }
                if (exam_category && exam_category !== "all") {
                    params.exam_category = Number(exam_category);
                }

                const res = await studentService.getAllSubmissions(params, page);

                const submissionsData = res?.submissions?.data ?? [];
                const totalItems = res?.submissions?.total ?? 0;

                setSubscriptions(submissionsData);
                setTotalItems(totalItems);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [pageSize, searchTerm, selectedExamType, selectedExamCategory]
    );

    useEffect(() => {
        getSubmissions(currentPage, pageSize, searchTerm, selectedExamType, selectedExamCategory);
    }, [currentPage, pageSize, getSubmissions, searchTerm, selectedExamType, selectedExamCategory]);

    useEffect(() => {
        async function getTypes() {
            const res = await examService.getExamType()
            setExamTypes(
            res.map((e: any) => ({
                value: String(e.id), 
                label: e.name
            }))
            )
        }
        getTypes()
    }, [])

    const columns: ColumnDef<Subscription>[] = [
        {
            accessorKey: "id",
            header: "ID",
            size: 50,
        },
        {
            accessorKey: "student_name",
            header: "Name",
            cell: ({ getValue }) => {
                const val = getValue<string>();
                return val ? (
                    <div className="max-w-[150px] break-words whitespace-normal">{val}</div> 
                ) : (
                    <div className="text-center text-3xl">-</div> 
                );
            }
        },
        {
            accessorKey: "student_email",
            header: "Email",
        },
        {
            accessorKey: "exam_name",
            header: "Exam Name",
            cell: ({ getValue }) => {
                const val = getValue<string>();
                return val ? (
                    <div className="max-w-[400px] break-words whitespace-normal">{val}</div> 
                ) : (
                    <div className="text-center text-3xl">-</div> 
                );
            }
        },
        {
            accessorKey: "exam_type",
            header: "Exam Type",
            cell: ({ getValue }) => {
                const val = getValue<string>();
                return val ? (
                    <div className="max-w-[300px] break-words whitespace-normal">{val}</div> 
                ) : (
                    <div className="text-center text-3xl">-</div> 
                );
            }
        },
        {
            accessorKey: "exam_category",
            header: "Exam Category",
        },
        {
            accessorKey: "score",
            header: "Score",
            size: 50,
            cell: ({ getValue }) => {
                const val = getValue<number | null>();
                return val !== null ? (
                    <div className="max-w-[150px] break-words whitespace-normal">{val}</div> 
                ) : (
                    <div className="text-center text-3xl">-</div> 
                );
            }
        },
    ]

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Submissions</h1>
            <ReusableDataTable
                columns={columns}
                data={subscriptions}
                currentPage={currentPage}
                totalItems={totalItems}
                loading={loading}
                pageSize={pageSize}
                onPageChangeAction={(page: number) => setCurrentPage(page)}
                onPageSizeChange={(size: number) => setPageSize(size)}
                onSearchAction={(val) => {
                    setSearchTerm(val)
                    if (val !== searchTerm) setCurrentPage(1)
                }}
                filters={[
                    {
                        label: "Exam Type",
                        options: examTypes,
                        selectedValue: selectedExamType,
                        onChange: (val) => {
                        setSelectedExamType(val === "all" ? "" : String(val));
                        setCurrentPage(1);
                        },
                    },
                    {
                        label: "Exam Category",
                        options: examCategories,
                        selectedValue: selectedExamCategory !== null ? String(selectedExamCategory) : "all",
                        onChange: (val) => {
                            setSelectedExamCategory(val === "all" ? "" : String(val));
                            setCurrentPage(1);
                        },
                    }

                ]}
                searchPlaceholder="Search by email..."
                enableSearch={true}
            />
        </div>
    )
}