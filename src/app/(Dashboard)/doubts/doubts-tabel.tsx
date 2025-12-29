"use client"

import {memo, useCallback, useMemo, useState} from "react"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import type {ColumnDef, Row} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ReusableDataTable} from "@/components/table/ReusableDataTable"
import {doubtService} from "@/service/doubt.service"
import ResolveDoubtDialog from "@/components/modal/doubtDialog"
import {CheckCircle2, ChevronDown, ChevronUp, Clock, MessageSquare, User} from "lucide-react"
import {cn} from "@/lib/utils"

interface Option {
    id: number
    question_id: number
    option: string
    value: number
}

interface Question {
    question: string
    options: Option[]
    explanation: string
}

interface Student {
    name: string
}

interface Doubt {
    id: number
    status: string
    doubt: string
    date: string | null
    remark: string
    question: Question
    exam_name: string
    student: Student
}

export function DoubtsTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const queryClient = useQueryClient()

    const {data, isLoading} = useQuery({
        queryKey: ["doubts", currentPage, searchQuery],
        queryFn: async () => {
            const res = await doubtService.getAllDoubts({
                page: currentPage,
                search: searchQuery,
            })
            return {
                data: res?.data?.data?.data ?? [],
                current_page: res?.data?.data?.current_page ?? 1,
                last_page: res?.data?.data?.last_page ?? 1,
                total: res?.data?.data?.total ?? 0,
            }
        },
    })

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query)
        setCurrentPage(1)
    }, [])

    const handleResolveClick = useCallback((doubt: Doubt) => {
        setSelectedDoubt(doubt)
        setDialogOpen(true)
    }, [])

    const handleDialogClose = useCallback(() => {
        setDialogOpen(false)
        setSelectedDoubt(null)
    }, [])

    const handleSuccess = useCallback(() => {
        setDialogOpen(false)
        setSelectedDoubt(null)
        queryClient.invalidateQueries({queryKey: ["doubts"]})
    }, [queryClient])

    const columns: ColumnDef<Doubt>[] = useMemo(
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
                            className="p-0 w-7 h-7 shrink-0"
                            onClick={row.getToggleExpandedHandler()}
                            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                        >
                            {row.getIsExpanded() ? (
                                <ChevronUp className="w-4 h-4" aria-hidden="true"/>
                            ) : (
                                <ChevronDown className="w-4 h-4" aria-hidden="true"/>
                            )}
                        </Button>
                    ) : null,
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 130,
                cell: ({row}) => {
                    const isResolved = row.original.status === "Resolved"
                    return (
                        <div className="flex items-center gap-2">
                            {isResolved ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true"/>
                            ) : (
                                <Clock className="w-4 h-4 text-yellow-600 shrink-0" aria-hidden="true"/>
                            )}
                            <Badge
                                variant={isResolved ? "default" : "secondary"}
                                className={cn(
                                    "whitespace-nowrap font-medium",
                                    isResolved && "bg-green-600 hover:bg-green-700 text-white",
                                    !isResolved && "bg-yellow-600 hover:bg-yellow-700 text-white"
                                )}
                                aria-label={`Status: ${row.original.status}`}
                            >
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                },
            },
            {
                accessorKey: "question",
                header: "Question",
                size: 300,
                cell: ({row}) => (
                    <div className="flex flex-col gap-1 min-w-0 max-w-xs">
                        <span
                            className="text-sm font-medium leading-snug line-clamp-2 wrap-break-word"
                            title={row.original.question.question}
                        >
                            {row.original.question.question}
                        </span>
                        {row.original.date && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(row.original.date).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "student",
                header: "Student",
                size: 180,
                cell: ({row}) => (
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                            aria-hidden="true"
                        >
                            <span className="text-sm font-semibold text-primary">
                                {row.original.student?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4"/>}
                            </span>
                        </div>
                        <span
                            className="text-sm font-medium truncate"
                            title={row.original.student?.name || "Unknown"}
                        >
                            {row.original.student?.name || "Unknown"}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "doubt",
                header: "Doubt",
                size: 350,
                cell: ({row}) => (
                    <div className="flex items-start gap-2 min-w-0">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true"/>
                        <p
                            className="text-sm leading-relaxed line-clamp-2 wrap-break-word"
                            title={row.original.doubt}
                        >
                            {row.original.doubt}
                        </p>
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                size: 120,
                cell: ({row}) => {
                    const isResolved = row.original.status === "Resolved"
                    return (
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={isResolved ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => handleResolveClick(row.original)}
                                        disabled={isResolved}
                                        className="whitespace-nowrap font-medium"
                                        aria-label={isResolved ? "View doubt details" : "Resolve doubt"}
                                    >
                                        {isResolved ? "View" : "Resolve"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    <p>
                                        {isResolved
                                            ? "View doubt details"
                                            : "Mark doubt as resolved"}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                },
            },
        ],
        [handleResolveClick]
    )

    const renderSubComponent = useCallback(
        (row: Row<Doubt>) => {
            const isResolved = row.original.status === "Resolved"

            return (
                <div className="bg-muted/50 p-4 sm:p-6 border-t">
                    <div className="space-y-4 sm:space-y-6 max-w-5xl">
                        <DetailCard
                            icon={<MessageSquare className="w-4 h-4" aria-hidden="true"/>}
                            title="Question"
                        >
                            <p className="text-sm leading-relaxed break-words">
                                {row.original.question.question}
                            </p>
                        </DetailCard>

                        <DetailCard title="Options">
                            <div className="space-y-2">
                                {row.original.question.options.map((opt) => (
                                    <OptionItem key={opt.id} option={opt}/>
                                ))}
                            </div>
                        </DetailCard>

                        {row.original.doubt && (
                            <DetailCard title="Student's Doubt">
                                <p className="text-sm leading-relaxed break-words">
                                    {row.original.doubt}
                                </p>
                            </DetailCard>
                        )}

                        {row.original.remark && (
                            <DetailCard title="Remark">
                                <p className="text-sm leading-relaxed text-muted-foreground break-words">
                                    {row.original.remark}
                                </p>
                            </DetailCard>
                        )}

                        {row.original.question.explanation && (
                            <DetailCard title="Explanation">
                                <div className="text-sm leading-relaxed text-muted-foreground max-h-96 overflow-y-auto">
                                    <p className="whitespace-pre-wrap break-words">
                                        {row.original.question.explanation}
                                    </p>
                                </div>
                            </DetailCard>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant={isResolved ? "outline" : "default"}
                                size="sm"
                                onClick={() => handleResolveClick(row.original)}
                                disabled={isResolved}
                                className="font-medium"
                                aria-label={isResolved ? "View doubt details" : "Resolve doubt"}
                            >
                                {isResolved ? "View Details" : "Resolve Doubt"}
                            </Button>
                        </div>
                    </div>
                </div>
            )
        },
        [handleResolveClick]
    )

    const doubts = data?.data ?? []
    const totalPages = data?.last_page ?? 1
    const totalCount = data?.total ?? 0

    return (
        <>
            <ReusableDataTable
                data={doubts}
                columns={columns}
                loading={isLoading}
                enableExpanding
                getRowCanExpand={() => true}
                renderSubComponent={renderSubComponent}
                enableSearch
                enableSorting
                enableRowSelection
                searchPlaceholder="Search by student name or doubt..."
                onSearchAction={handleSearchChange}
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize: doubts.length,
                    onPageChangeAction: setCurrentPage,
                    dataCount: totalCount,
                }}
                actionLabel="Export Data"
            />

            <ResolveDoubtDialog
                doubt={selectedDoubt}
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onSuccess={handleSuccess}
            />
        </>
    )
}

interface DetailCardProps {
    icon?: React.ReactNode
    title: string
    children: React.ReactNode
}

const DetailCard = memo(function DetailCard({icon, title, children}: DetailCardProps) {
    return (
        <div className="space-y-3 p-4 bg-background rounded-lg border shadow-sm">
            <p className="font-semibold text-sm flex items-center gap-2">
                {icon}
                {title}
            </p>
            {children}
        </div>
    )
})

interface OptionItemProps {
    option: Option
}

const OptionItem = memo(function OptionItem({option}: OptionItemProps) {
    const isCorrect = option.value === 1

    return (
        <div
            className={cn(
                "p-3 rounded-md border text-sm transition-colors",
                isCorrect
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    : "bg-background hover:bg-muted/50"
            )}
            role="option"
            aria-selected={isCorrect}
        >
            <div className="flex items-center gap-2">
                {isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-label="Correct answer"/>
                )}
                <span className="break-words">{option.option}</span>
            </div>
        </div>
    )
})