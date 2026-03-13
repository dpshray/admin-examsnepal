"use client"

import type {ColumnDef, Row} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Award, ChevronDown, ChevronUp} from "lucide-react"
import {useCallback, useMemo, useState} from "react"
import {useQuery} from "@tanstack/react-query"
import {ReusableDataTable} from "@/components/table/ReusableDataTable"
import {studentService} from "@/service/student.service"
import {examService} from "@/service/exam.service"
import SelectInputField from "@/components/field/SelectInputField"
import {cn} from "@/lib/utils"
import { examTypeService } from "@/service/examTypes.service"

interface Submission {
    id: number
    student_name: string
    student_email: string
    exam_name: string
    exam_type: string
    exam_category: string
    score: number
}

export function SubmissionsTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [examTypeFilter, setExamTypeFilter] = useState<string | number>("")

    const pageSize = 10

    const {data, isLoading} = useQuery({
        queryKey: ["submissions", currentPage, searchQuery, examTypeFilter],
        queryFn: async () => {
            const params: Record<string, any> = {
                limit: pageSize,
                page: currentPage,
                search: searchQuery
            }

            if (examTypeFilter && examTypeFilter !== "") {
                params.exam_type = Number(examTypeFilter)
            }

            const res = await studentService.getAllSubmissions(params)
            return {
                data: res?.submissions?.data ?? [],
                total: res?.submissions?.total ?? 0,
                last_page: res?.submissions?.last_page ?? 1,
            }
        },
    })

    const {data: examType = [], isLoading: isLoadingExamTypes} = useQuery({
        queryKey: ["examTypes"],
        queryFn: () => examTypeService.getAllExamType(),
    })

    const examTypes = useMemo(() => {
        return examType?.data?.data ?? []
    }, [examType])


    const examOptions = useMemo(() => {
        if (!examTypes || examTypes.length === 0) return []
            return examTypes.map((examType: { id: number; name: string }) => ({
            label: examType.name,
            value: examType.id,
        }))
    }, [examTypes])

    const submissions = data?.data ?? []
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

    const getScoreColor = useCallback((score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-yellow-600"
        return "text-red-600"
    }, [])

    const getScoreBadgeVariant = useCallback((score: number): "default" | "secondary" | "destructive" => {
        if (score >= 80) return "default"
        if (score >= 60) return "secondary"
        return "destructive"
    }, [])

    const columns: ColumnDef<Submission>[] = useMemo(
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
                    <span className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                        #{row.original.id}
                    </span>
                ),
            },
            {
                accessorKey: "student_name",
                header: "Student",
                size: 200,
                cell: ({row}) => (
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate" title={row.original.student_name}>
                            {row.original.student_name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate" title={row.original.student_email}>
                            {row.original.student_email}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "exam_name",
                header: "Exam",
                size: 220,
                cell: ({row}) => (
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-medium text-sm truncate" title={row.original.exam_name}>
                            {row.original.exam_name}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {row.original.exam_type}
                            </Badge>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "exam_category",
                header: "Category",
                size: 150,
                cell: ({row}) => (
                    <Badge variant="secondary" className="font-normal whitespace-nowrap">
                        {row.original.exam_category}
                    </Badge>
                ),
            },
            {
                accessorKey: "score",
                header: "Score",
                size: 120,
                cell: ({row}) => (
                    <div className="flex items-center gap-2">
                        <Award className={cn("w-4 h-4 shrink-0", getScoreColor(row.original.score))}/>
                        <Badge
                            variant={getScoreBadgeVariant(row.original.score)}
                            className={cn(
                                "font-semibold whitespace-nowrap",
                                row.original.score >= 80 && "bg-green-600 hover:bg-green-700"
                            )}
                        >
                            {row.original.score}%
                        </Badge>
                    </div>
                ),
            },
        ],
        [getScoreColor, getScoreBadgeVariant]
    )

    const renderSubComponent = useCallback(
        (row: Row<Submission>) => (
            <div className="bg-muted/50 p-4 sm:p-6 border-t">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 ">
                    <div className="space-y-1.5 p-3 bg-background rounded-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Student Name
                        </p>
                        <p className="text-sm font-semibold break-words">{row.original.student_name}</p>
                    </div>
                    <div className="space-y-1.5 p-3 bg-background rounded-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Student Email
                        </p>
                        <p className="text-sm font-semibold break-all">{row.original.student_email}</p>
                    </div>
                    <div className="space-y-1.5 p-3 bg-background rounded-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Exam Type
                        </p>
                        <p className="text-sm font-semibold wrap-break-word">{row.original.exam_type}</p>
                    </div>
                    <div className="space-y-1.5 p-3 bg-background rounded-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Category
                        </p>
                        <p className="text-sm font-semibold break-words">{row.original.exam_category}</p>
                    </div>
                </div>
            </div>
        ),
        []
    )

    return (
        <ReusableDataTable
            data={submissions}
            columns={columns}
            loading={isLoading}
            enableExpanding
            getRowCanExpand={() => true}
            renderSubComponent={renderSubComponent}
            enableSearch
            enableSorting
            enableRowSelection
            searchPlaceholder="Search by student name or email..."
            onSearchAction={handleSearchChange}
            pagination={{
                page: currentPage,
                totalPages,
                pageSize,
                onPageChangeAction: setCurrentPage,
                dataCount: totalCount,
            }}
            actionLabel="Export Data"
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
    )
}