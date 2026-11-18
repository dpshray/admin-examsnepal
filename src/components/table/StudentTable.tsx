"use client"

import type {ColumnDef, Row} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Switch} from "@/components/ui/switch"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {BadgeDollarSign, ChevronDown, ChevronUp, MessageCircle, ShieldCheck} from "lucide-react"
import {useCallback, useMemo, useState} from "react"
import {useQuery} from "@tanstack/react-query"
import {ReusableDataTable} from "@/components/table/ReusableDataTable"
import {studentService} from "@/service/student.service"
import SelectInputField from "@/components/field/SelectInputField"
import {cn} from "@/lib/utils"
import SubscriptionDialog from "@/components/modal/SubscriptionDialog"
import WhatsAppMessageDialog, {toWhatsAppNumber} from "@/components/modal/WhatsAppMessageDialog"
import { examTypeService } from "@/service/examTypes.service"
import {toast} from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Student {
    id: number
    name: string
    email: string
    phone: string
    exam_type: string
    registered_date: string | null
    email_verified_at: string | null
    is_subscripted: string
    subscription_start_date: string | null
    subscription_end_date: string | null
    remark: string | null
}

export function StudentsDataTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [examTypeFilter, setExamTypeFilter] = useState<string | number>("")
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [verifyingIds, setVerifyingIds] = useState<Set<number>>(new Set())
    const [revokeTarget, setRevokeTarget] = useState<Student | null>(null)
    const [whatsAppTarget, setWhatsAppTarget] = useState<Student | null>(null)

    const {data, isLoading, refetch} = useQuery({
        queryKey: ["students", currentPage, searchQuery, examTypeFilter],
        queryFn: async () => {
            const res = await studentService.getAllStudents({
                page: currentPage,
                search: searchQuery,
                exam_type: examTypeFilter,
            })
            return res.students
        },
    })

    const {data: examType = [], isLoading: isLoadingExamTypes} = useQuery({
        queryKey: ["examTypes"],
        queryFn: () => examTypeService.getAllExamType({status: 1}),
    })

    const examTypes = useMemo(() => {
        return examType?.data?.data ?? []
    }, [examType])

    const examOptions = useMemo(() => {
        if (!examTypes || examTypes.length === 0) return []
        return [
            {label: "All Exam Types", value: ""},
            ...examTypes.map((examType: { id: number; name: string }) => ({
                label: examType.name,
                value: examType.id,
            }))
        ]
    }, [examTypes])

    const students = data?.data ?? []
    const totalPages = data?.last_page ?? 1
    const totalCount = data?.total ?? 0

    const handleExamTypeChange = useCallback((val: string | number) => {
        setExamTypeFilter(val)
        setCurrentPage(1)
    }, [])

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query)
        setCurrentPage(1)
    }, [])

    const handleOpenSubscriptionDialog = useCallback((student: Student) => {
        setSelectedStudent(student)
        setIsSubscriptionDialogOpen(true)
    }, [])

    const handleCloseSubscriptionDialog = useCallback(() => {
        setIsSubscriptionDialogOpen(false)
        setSelectedStudent(null)
    }, [])

    const updateVerification = useCallback(async (id: number, request: () => Promise<any>) => {
        setVerifyingIds(prev => new Set(prev).add(id))

        try {
            const response = await request()
            toast.success(response?.message ?? "Student updated")
            await refetch()
        } catch (error: any) {
            toast.error(error?.message ?? "Could not update the student's verification")
        } finally {
            setVerifyingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }, [refetch])

    const handleEmailVerifyToggle = useCallback((student: Student, isVerified: boolean) => {
        if (isVerified) {
            setRevokeTarget(student)
        } else {
            updateVerification(student.id, () => studentService.verifyStudent(student.id))
        }
    }, [updateVerification])

    const confirmRevoke = useCallback(() => {
        if (!revokeTarget) return
        const {id} = revokeTarget
        setRevokeTarget(null)
        updateVerification(id, () => studentService.revokeStudentVerification(id))
    }, [revokeTarget, updateVerification])

    const columns: ColumnDef<Student>[] = useMemo(
        () => [
            {
                id: "expander",
                header: () => null,
                size: 40,
                cell: ({row}) =>
                    row.getCanExpand() ? (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="p-0 w-7 h-7"
                            onClick={row.getToggleExpandedHandler()}
                            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                        >
                            {row.getIsExpanded() ? (
                                <ChevronUp className="w-4 h-4"/>
                            ) : (
                                <ChevronDown className="w-4 h-4"/>
                            )}
                        </Button>
                    ) : null,
            },
            {
                accessorKey: "id",
                header: "ID",
                size: 80,
                cell: ({row}) => (
                    <span className="font-mono text-sm text-muted-foreground">
                        #{row.original.id}
                    </span>
                ),
            },
            {
                accessorKey: "name",
                header: "Name",
                size: 180,
                cell: ({ row }) => (
                    <div className="flex flex-col max-w-45">
                        <span className="font-medium wrap-break-word">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground wrap-break-word">{row.original.phone}</span>
                    </div>
                ),
            },

            {
                accessorKey: "email",
                header: "Email",
                size: 220,
                cell: ({row}) => (
                    <span className="text-sm truncate">{row.original.email}</span>
                ),
            },
            {
                accessorKey: "exam_type",
                header: "Exam Type",
                size: 150,
                cell: ({row}) => (
                    <Badge variant="secondary" className="font-normal">
                        {row.original.exam_type}
                    </Badge>
                ),
            },
            {
                accessorKey: "email_verified_at",
                header: "Email Verified",
                size: 140,
                cell: ({row}) => {
                    const isVerified = row.original.email_verified_at && row.original.email_verified_at !== "Not Verified"
                    const isVerifying = verifyingIds.has(row.original.id)

                    return (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={cn(
                                            "relative inline-flex items-center",
                                            isVerifying && "opacity-50 pointer-events-none"
                                        )}>
                                            <Switch
                                                checked={!!isVerified}
                                                onCheckedChange={() => handleEmailVerifyToggle(row.original, !!isVerified)}
                                                disabled={isVerifying}
                                                className={cn(
                                                    "data-[state=checked]:bg-emerald-600",
                                                    "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                                                )}
                                            />
                                            {isVerified && (
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs">
                                        {isVerified
                                            ? "Email verified. Click to revoke verification"
                                            : "Email not verified. Click to verify"}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                },
            },
            {
                accessorKey: "is_subscripted",
                header: "Subscription",
                size: 130,
                cell: ({row}) => {
                    const isSubscribed = row.original.is_subscripted !== "Not Subscribed"
                    return (
                        <Badge
                            variant={isSubscribed ? "default" : "destructive"}
                            className={cn(
                                "text-xs font-medium",
                                isSubscribed && "bg-emerald-600 hover:bg-emerald-700"
                            )}
                        >
                            {isSubscribed ? "Active" : "Inactive"}
                        </Badge>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                size: 120,
                cell: ({row}) => {
                    const hasPhone = !!toWhatsAppNumber(row.original.phone)
                    return (
                    <TooltipProvider delayDuration={300}>
                        <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                    onClick={() => handleOpenSubscriptionDialog(row.original)}
                                >
                                    <BadgeDollarSign className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Manage subscription</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={hasPhone ? -1 : 0}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                                        onClick={() => setWhatsAppTarget(row.original)}
                                        disabled={!hasPhone}
                                        aria-label="Send WhatsApp message"
                                    >
                                        <MessageCircle className="h-4 w-4"/>
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>{hasPhone ? "Send WhatsApp message" : "No valid phone number"}</p>
                            </TooltipContent>
                        </Tooltip>
                        </div>
                    </TooltipProvider>
                    )
                },
            },
        ],
        [handleOpenSubscriptionDialog, handleEmailVerifyToggle, verifyingIds]
    )

    const renderSubComponent = useCallback(
        (row: Row<Student>) => (
            <div className="bg-muted/50 p-6 space-y-4 border-t">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Subscription Start
                        </p>
                        <p className="text-sm font-semibold">
                            {row.original.subscription_start_date || "—"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Subscription End
                        </p>
                        <p className="text-sm font-semibold">
                            {row.original.subscription_end_date || "—"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Registered Date
                        </p>
                        <p className="text-sm font-semibold">
                            {row.original.registered_date || "—"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Remark
                        </p>
                        <p className="text-sm font-semibold">
                            {row.original.remark || "No remarks"}
                        </p>
                    </div>
                </div>
            </div>
        ),
        []
    )

    return (
        <div>
            <ReusableDataTable
                data={students}
                columns={columns}
                loading={isLoading}
                enableExpanding
                getRowCanExpand={() => true}
                renderSubComponent={renderSubComponent}
                enableSearch={true}
                enableSorting
                enableRowSelection
                searchPlaceholder="Search by name, email, or phone..."
                onSearchAction={handleSearchChange}
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize: students.length,
                    onPageChangeAction: setCurrentPage,
                    dataCount: totalCount,
                }}
                actionLabel="Add Student"
            >
                <SelectInputField
                    placeholder="Filter by exam type"
                    options={examOptions}
                    value={examTypeFilter}
                    onChangeAction={handleExamTypeChange}
                    disabled={isLoadingExamTypes}
                    className="w-full sm:w-64"
                />
            </ReusableDataTable>

            <SubscriptionDialog
                student={selectedStudent}
                isOpen={isSubscriptionDialogOpen}
                onClose={handleCloseSubscriptionDialog}
            />

            <WhatsAppMessageDialog
                student={whatsAppTarget}
                isOpen={!!whatsAppTarget}
                onClose={() => setWhatsAppTarget(null)}
            />

            <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke email verification?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {revokeTarget?.name} ({revokeTarget?.email}) will be blocked from logging in and using
                            their account until their email is verified again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRevoke}>Revoke</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}