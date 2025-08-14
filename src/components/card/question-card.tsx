import React from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Edit, Trash2} from "lucide-react"

interface QuestionOption {
    id: number
    question_id: number
    option: string
    value: number
}

interface Question {
    id: number
    exam_id?: number
    exam_type_id?: number
    uploader?: string | null
    added_by?: number | null
    subject_id?: number | null
    question: string
    explanation?: string | null
    subject?: string | null
    remark?: string | null
    serial?: string | null
    mark_type?: string | null
    options?: QuestionOption[] | null
}

interface QuestionCardProps {
    question: Question
    index: number
}

export default function QuestionCard({question, index}: QuestionCardProps) {
    const options = question.options ?? []

    return (
        <Card className="w-full mx-auto overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg flex-1 min-w-0 break-words">Question {index + 1}</CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4"/>
                        </Button>
                        <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium text-lg break-words leading-relaxed">{question.question}</p>

                <div className="space-y-2">
                    {options.map((option, optionIndex) => (
                        <div
                            key={option.id}
                            className={`p-3 rounded-lg border overflow-hidden ${
                                option.value === 1 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="font-medium text-sm flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                                    <span className="break-words leading-relaxed">{option.option}</span>
                                </div>
                                {option.value === 1 && (
                                    <Badge variant="default" className="text-xs bg-green-600 flex-shrink-0">
                                        Correct
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 overflow-hidden">
                        <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                        <p className="text-blue-800 text-sm leading-relaxed break-words">{question.explanation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
