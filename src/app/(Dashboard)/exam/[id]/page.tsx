"use client"

import {useCallback, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, Plus, Upload, X} from "lucide-react"
import QuestionCard from "@/components/question/question-card"
import {examService} from "@/service/exam.service"
import CustomPagination from "@/components/Custom-Pagination"
import {toast} from "sonner"
import CreateQuestionForm from "@/components/question/CreateQuestionForm"
import {cn} from "@/lib/utils";

interface Question {
    id: number
}

interface Exam {
    id: number
    exam_name: string
    description: string
    is_active: boolean
    exam_type: {
        name: string
    }
}

export default function ExamQuestionsPage() {
    const {id} = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const examId = Number(id)
    const [showAddForm, setShowAddForm] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const {data, isLoading} = useQuery({
        queryKey: ["exam-questions", examId, currentPage],
        queryFn: async () => await examService.getExamById(examId, currentPage),
    })

    const exam: Exam | null = data?.exam ?? null
    const questions: Question[] = data?.questions?.data ?? []
    const totalPages = data?.questions?.last_page ?? 1
    const total = data?.questions?.total ?? 0

    const handleGoBack = () => router.back()

    const handlePageChange = (page: number) => setCurrentPage(page)

    const handleQuestionCreated = () => {
        setShowAddForm(false)
        window.scrollTo({top: 0, behavior: "smooth"})
        queryClient.invalidateQueries({queryKey: ["exam-questions", examId]})
        toast.success("Question created successfully")
    }

    const handleQuestionUpdated = () => {
        queryClient.invalidateQueries({queryKey: ["exam-questions", examId]})
        toast.success("Question updated successfully")
    }

    const handleQuestionDelete = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ["exam-questions", examId],
            exact: false,
        })
    }, [examId, queryClient])

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 sm:p-6 overflow-x-hidden">
                <div className="max-w-7xl mx-auto animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"/>
                    <div className="h-4 bg-gray-200 rounded w-1/2"/>
                    <div className="h-32 bg-gray-200 rounded"/>
                </div>
            </main>
        )
    }

    if (!exam) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center overflow-x-hidden">
                <div className="text-center space-y-4">
                    <h1 className="text-xl sm:text-2xl font-bold">Exam Not Found</h1>
                    <Button onClick={handleGoBack}>
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <Button variant="ghost" onClick={handleGoBack} className="mb-4 flex gap-2 h-9 px-3">
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="hidden sm:inline">Back to Exams</span>
                        <span className="sm:hidden">Back</span>
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold capitalize wrap-break-word">{exam.exam_name}</h1>
                            <p className="text-gray-600 text-sm sm:text-base max-w-2xl">{exam.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                <Badge variant={exam.is_active ? "default" : "secondary"}>
                                    {exam.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{exam.exam_type.name}</Badge>
                                <span className="text-xs sm:text-sm text-gray-500">
                                      {total} question{total !== 1 ? "s" : ""}
                                    </span>
                            </div>
                        </div>

                        <div className="flex flex-col xs:flex-row gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                            <Button variant="outline" className="flex-1 lg:flex-none bg-transparent">
                                <Upload className="w-4 h-4 mr-2"/>
                                Upload
                            </Button>
                            <Button onClick={() => setShowAddForm((v) => !v)}
                                    className={cn('flex-1 lg:flex-none', showAddForm ? 'bg-red-500 hover:bg-red-600' : 'bg-primary')}>
                                {
                                    showAddForm ? (
                                        <X className="w-4 h-4 mr-2"/>
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2"/>
                                    )
                                }
                                {showAddForm ? "Cancel" : "Add Question"}
                            </Button>
                        </div>
                    </div>
                </header>

                {showAddForm && (
                    <Card className="mb-6 overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                            <CreateQuestionForm examId={examId} onSubmitAction={handleQuestionCreated}/>
                        </CardContent>
                    </Card>
                )}

                <section className="mt-6">
                    {questions.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {questions.map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question as any}
                                    index={index}
                                    onUpdatedAction={handleQuestionUpdated}
                                    onDeleteAction={handleQuestionDelete}
                                />
                            ))}
                            <div className="pt-4 flex justify-center">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChangeAction={handlePageChange}
                                />
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-10 sm:py-16 px-4">
                                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold">No questions yet</h3>
                                <p className="text-gray-600 mb-6 text-sm sm:text-base">Upload questions or add them
                                    manually</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                                    <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                                        <Upload className="w-4 h-4 mr-2"/>
                                        Upload
                                    </Button>
                                    <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2"/>
                                        Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </main>
    )
}
