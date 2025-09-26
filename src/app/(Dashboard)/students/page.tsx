"use client"

import { useCallback, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableDataTable } from "@/components/table/ReusableDataTable"
import { studentService } from "@/service/student.service"
import { Button } from "@/components/ui/button"
import SubscriptionDialog from "@/components/modal/SubscriptionDialog"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { examService } from "@/service/exam.service"

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    exam_type: number;
    registered_date: string | null;
    is_subscripted: number;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState("")
    const [examTypes, setExamTypes] = useState<{ value: string; label: string }[]>([])
    const [selectedExamType, setSelectedExamType] = useState<string>("");

    const fetchStudents = useCallback(
        async (page: number = 1, size: number = pageSize, search: string = searchTerm, examType: string = selectedExamType) => {
            setLoading(true);
            try {
                const params: any = { limit: size, search }; 
                if (examType && examType !== "all") {
                    params.exam_type = Number(examType);
                }

                const res = await studentService.getAllStudents(params, page);

                const studentsData = res?.students?.data ?? [];
                const totalItems = res?.students?.total ?? 0;

                setStudents(studentsData);
                setTotalItems(totalItems);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [pageSize, searchTerm, selectedExamType]
    );

    useEffect(() => {
        fetchStudents(currentPage, pageSize, searchTerm, selectedExamType)
    }, [currentPage, pageSize, searchTerm, selectedExamType, fetchStudents])

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


    const openSubscriptionModal = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const closeSubscriptionModal = () => {
        setSelectedStudent(null);
        setIsModalOpen(false);
    };

    const columns: ColumnDef<Student>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
        enableSorting: false
    },
    {
        accessorKey: "exam_type",
        header: "Exam Type",
        cell: ({ getValue }) => {
            const val = getValue<number | null>();
            return val ? (
                <div className="max-w-[150px] break-words whitespace-normal">{val}</div> 
            ) : (
                <div className="text-center text-3xl">-</div> 
            );
        },
    },
    {
        accessorKey: "registered_date",
        header: "Registered Date",
    },
    {
        accessorKey: "email_verified_at",
        header: "Email Verified",
        cell: ({ getValue }) => {
            const val = (getValue<string>() || "").toLowerCase();

            const isActive = val.includes("verified") && !val.includes("not");

            return (
            <Badge variant={isActive ? "green" : "destructive"}>
                {getValue<string>()}
            </Badge>
            );
        },
    },
    {
        accessorKey: "is_subscripted",
        header: "Subscription Status",
        cell: ({ getValue }) => {
            const val = (getValue<string>() || "").toLowerCase();

            const isActive = val.includes("subscribed") && !val.includes("not");

            return (
            <Badge variant={isActive ? "green" : "destructive"}>
                {getValue<string>()}
            </Badge>
            );
        },
    },
    {
        accessorKey: "subscription_start_date",
        header: "Subscription Start Date",
        cell: ({ getValue }) => {
            const val = getValue<string | null>();
            if (!val) return <div className="text-center text-3xl">-</div>;
            return format(new Date(val), "dd MMM yyyy, hh:mm a");
        },
    },
    {
        accessorKey: "subscription_end_date",
        header: "Subscription End Date",
        cell: ({ getValue }) => {
            const val = getValue<string | null>();
            if (!val) return <div className="text-center text-3xl">-</div>;
            return format(new Date(val), "dd MMM yyyy, hh:mm a");
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
                className="px-2 py-1 text-white bg-green-600 hover:bg-green-700 rounded text-sm"
                onClick={() => openSubscriptionModal(row.original)}
            >
                Add Subscription
            </Button>
        ),
    }
    ]

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Students</h1>
            <ReusableDataTable
                columns={columns}
                data={students}
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                loading={loading}
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
                ]}
                searchPlaceholder="Search students by email..."
            />
            
            <SubscriptionDialog
                student={selectedStudent}
                isOpen={isModalOpen}
                onClose={closeSubscriptionModal}
                onSuccess={() => fetchStudents(currentPage, pageSize, searchTerm, selectedExamType)}
            />
        </div>
    )
}
