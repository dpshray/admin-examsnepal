"use client"

import { useCallback, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableDataTable } from "@/components/table/ReusableDataTable"
import { studentService } from "@/service/student.service"
import { Button } from "@/components/ui/button"
import SubscriptionDialog from "@/components/modal/SubscriptionDialog"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Student {
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

    const fetchStudents = useCallback(
        async (page: number = 1, size: number = pageSize) => {
            setLoading(true);
            try {
                const params = { limit: size }; 
                const res = await studentService.getAllStudents(params, page);
                console.log("Response:", res);

                const studentsData = res?.students?.data ?? [];
                const currentPage = res?.students?.current_page ?? page;
                const totalItems = res?.students?.total ?? 0;
                const perPage = size; 

                setStudents(studentsData);
                setCurrentPage(currentPage);
                setTotalItems(totalItems);
                setPageSize(perPage);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [pageSize]
    );

    useEffect(() => {
        fetchStudents(currentPage, pageSize)
    }, [currentPage, pageSize, fetchStudents])

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
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "exam_type",
        header: "Exam Type",
        cell: ({ getValue }) => {
            const val = getValue<number | null>();
            return (
                val ??
                 <div className="text-center text-3xl">-</div>
            )
        },
    },
    {
        accessorKey: "registered_date",
        header: "Registered Date",
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
                onPageChangeAction={(page: any) => setCurrentPage(page)}
                onPageSizeChange={(size: any) => setPageSize(size)}
            />
            
            <SubscriptionDialog
                student={selectedStudent}
                isOpen={isModalOpen}
                onClose={closeSubscriptionModal}
                onSuccess={() => fetchStudents(currentPage, pageSize)}
            />
        </div>
    )
}
