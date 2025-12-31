"use client"

import React, {useCallback, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, Plus, Upload} from "lucide-react"
import QuestionCard from "@/components/question/question-card"
import {examService} from "@/service/exam.service"
import CustomPagination from "@/components/Custom-Pagination"
import {toast} from "sonner"
import CreateQuestionForm from "@/components/question/CreateQuestionForm"

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

    console.log('Question',data)

    const exam: Exam | null = data?.exam ?? null
    const questions: Question[] = data?.questions?.data ?? []
    const totalPages = data?.questions?.last_page ?? 1
    const total = data?.questions?.total ?? 0

    const handleGoBack = () => router.back()

    const handlePageChange = (page: number) => setCurrentPage(page)

    const handleQuestionCreated = () => {
        setShowAddForm(false)
        queryClient.invalidateQueries({queryKey: ["exam-questions", examId]})
        toast.success("Question created successfully")
    }

    const handleQuestionUpdated = () => {
        queryClient.invalidateQueries({queryKey: ["exam-questions", examId]})
        toast.success("Question updated successfully")
    }
    const handleQuestionDelete=useCallback(async ()=>{
        queryClient.invalidateQueries({queryKey: ["exam-questions", examId]})
    },[examId, queryClient])

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"/>
                    <div className="h-4 bg-gray-200 rounded w-1/2"/>
                    <div className="h-32 bg-gray-200 rounded"/>
                </div>
            </main>
        )
    }

    if (!exam) {
        return (
            <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Exam Not Found</h1>
                    <Button onClick={handleGoBack}>
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6 w-full">
            <header className="mb-8">
                <Button variant="ghost" onClick={handleGoBack} className="mb-4 flex gap-2">
                    <ArrowLeft className="w-4 h-4"/>
                    Back to Exams
                </Button>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold capitalize">{exam.exam_name}</h1>
                        <p className="text-gray-600 mt-1">{exam.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <Badge variant={exam.is_active ? "default" : "secondary"}>
                                {exam.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{exam.exam_type.name}</Badge>
                            <span className="text-sm text-gray-500">
                                {total} question{total !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Upload className="w-4 h-4 mr-1"/>
                            Upload Questions
                        </Button>
                        <Button onClick={() => setShowAddForm(v => !v)}>
                            <Plus className="w-4 h-4 mr-1"/>
                            {showAddForm ? "Cancel" : "Add Question"}
                        </Button>
                    </div>
                </div>
            </header>

            {showAddForm && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <CreateQuestionForm
                            examId={examId}
                            onSubmitAction={handleQuestionCreated}
                        />
                    </CardContent>
                </Card>
            )}

            <section className="mt-6">
                {questions.length > 0 ? (
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <QuestionCard
                                key={question.id}
                                question={question as any}
                                index={index}
                                onUpdatedAction={handleQuestionUpdated}
                                onDeleteAction={handleQuestionDelete}
                            />
                        ))}
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChangeAction={handlePageChange}
                        />
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                            <h3 className="text-lg font-semibold">No questions yet</h3>
                            <p className="text-gray-600 mb-6">
                                Upload questions or add them manually
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button variant="outline">
                                    <Upload className="w-4 h-4 mr-1"/>
                                    Upload
                                </Button>
                                <Button onClick={() => setShowAddForm(true)}>
                                    <Plus className="w-4 h-4 mr-1"/>
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </section>
        </main>
    )
}