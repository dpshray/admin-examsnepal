"use client"

import {useCallback, useMemo, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {AlertCircle, BookOpen} from "lucide-react"
import {ExamCard, Exam} from "@/components/Exam/exam-card"
import {examService} from "@/service/exam.service"
import CustomPagination from "@/components/Custom-Pagination"
import ExamSkeletonCard from "@/components/skeleton/ExamSkeletonCard"
import {useQuery, useQueryClient} from "@tanstack/react-query"

import {useExamTypes} from "@/hooks/useExamTypes"
import {useExamCategories} from "@/hooks/useExamCategories"
import SelectInputField from "@/components/field/SelectInputField"
import {ExamModalForm} from "@/components/Exam/exam-modal-form";

export default function ExamDashboard() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isExamModalOpen, setIsExamModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [examType, setExamType] = useState<string | number>("")
    const [categoryType, setCategoryType] = useState<string | number>("")

    const {data: examTypesData, isLoading: examTypesLoading} = useExamTypes()
    const {data: examCategories, isLoading: categoriesLoading} = useExamCategories()

    const {data: examsData, isLoading: examsLoading, error, refetch} = useQuery({
        queryKey: ["exams", currentPage, examType, categoryType],
        queryFn: async () => {
            const params: Record<string, any> = {
                page: currentPage,
                per_page: 12,
            }

            if (examType) {
                params.exam_type_id = examType
            }

            if (categoryType) {
                params.category_type_id = categoryType
            }

            return await examService.getAllExams(params)
        },
    })

    const exams = useMemo(() => examsData?.data ?? [], [examsData?.data])
    const totalPages = useMemo(() => examsData?.last_page ?? 1, [examsData?.last_page])

    const examTypeOptions = useMemo(() => {
        if (!examTypesData || examTypesData.length === 0) return []
        return [
            {label: "All Exam Types", value: ""},
            ...examTypesData.map((type: { id: number; name: string }) => ({
                label: type.name,
                value: type.id,
            }))
        ]
    }, [examTypesData])

    const examCategoriesOptions = useMemo(() => {
        if (!examCategories || examCategories.length === 0) return []
        return [
            {label: "All Categories", value: ""},
            ...examCategories.map((category: { id: number; name: string }) => ({
                value: category.id,
                label: category.name,
            }))
        ]
    }, [examCategories])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const openExamModal = useCallback(() => {
        setIsExamModalOpen(true)
    }, [])

    const closeExamModal = useCallback(() => {
        setIsExamModalOpen(false)
        queryClient.invalidateQueries({queryKey: ["exams"]})
    }, [queryClient])

    const handleUploadQuestions = useCallback((id: number) => {
        router.push(`/exam/${id}`)
    }, [router])

    const handleDeleteExam = useCallback(async () => {
        await refetch()
    }, [refetch])

    const handleExamTypeChange = useCallback((value: string | number) => {
        setExamType(value)
        setCurrentPage(1)
    }, [])

    const handleCategoryChange = useCallback((value: string | number) => {
        setCategoryType(value)
        setCurrentPage(1)
    }, [])

    const handleExamUpdated = useCallback(() => {
        queryClient.invalidateQueries({queryKey: ["exams"]})
    }, [queryClient])

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <header
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Exam Management
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Create and manage your exams and questions
                        </p>
                    </div>
                    <Button
                        onClick={openExamModal}
                        disabled={examsLoading}
                        className="flex items-center gap-2 w-full sm:w-auto"
                        aria-label="Create new exam"
                    >
                        <BookOpen className="w-4 h-4"/>
                        Create New Exam
                    </Button>
                </header>

                {error && (
                    <Alert variant="destructive" className="mb-6" role="alert">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>
                            {error instanceof Error ? error.message : "Failed to load exams"}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
                    <SelectInputField
                        placeholder="Filter by exam type"
                        options={examTypeOptions}
                        value={examType}
                        onChangeAction={handleExamTypeChange}
                        disabled={examTypesLoading}
                        className="w-full sm:w-64"
                    />
                    <SelectInputField
                        placeholder="Filter by category"
                        options={examCategoriesOptions}
                        value={categoryType}
                        onChangeAction={handleCategoryChange}
                        disabled={categoriesLoading}
                        className="w-full sm:w-64"
                    />
                </div>

                {examsLoading ? (
                    <section aria-label="Loading exams">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {Array.from({length: 6}).map((_, index) => (
                                <ExamSkeletonCard key={index}/>
                            ))}
                        </div>
                    </section>
                ) : exams.length > 0 ? (
                    <section aria-label="Exam list">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {exams.map((exam: Exam) => (
                                <ExamCard
                                    key={exam.id}
                                    exams={exam}
                                    onUploadQuestions={handleUploadQuestions}
                                    onDeleteAction={handleDeleteExam}
                                    onUpdatedAction={handleExamUpdated}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center mt-6 sm:mt-8">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChangeAction={handlePageChange}
                                    maxPagesToShow={5}
                                />
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="text-center py-12 sm:py-16" aria-label="Empty state">
                        <BookOpen
                            className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4"
                            aria-hidden="true"
                        />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            No exams created yet
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-6">
                            Get started by creating your first exam
                        </p>
                        <Button onClick={openExamModal} disabled={examsLoading}>
                            <BookOpen className="w-4 h-4 mr-2"/>
                            Create New Exam
                        </Button>
                    </section>
                )}

                <ExamModalForm
                    isOpen={isExamModalOpen}
                    onClose={closeExamModal}
                    onSuccessAction={handleExamUpdated}
                />
            </div>
        </main>
    )
}