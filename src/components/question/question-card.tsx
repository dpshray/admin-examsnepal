"use client";

import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DeleteDialog } from "../modal/delete-model";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { examService } from "@/service/exam.service";
import EditQuestionForm from "@/components/question/UpdateQuestionForm";


interface QuestionOption {
    id: number;
    question_id: number;
    option: string;
    value: boolean;
}

interface Question {
    id: number;
    exam_id?: number;
    exam_type_id?: number;
    uploader?: string | null;
    added_by?: number | null;
    subject_id?: number | null;
    question: string;
    explanation?: string | null;
    subject?: string | null;
    remark?: string | null;
    serial?: string | null;
    mark_type?: string | null;
    options?: QuestionOption[] | null;
}

interface QuestionCardProps {
    question: Question;
    index: number;
    onDeleteAction?: (questionId: number) => Promise<void>;
    onUpdatedAction?: () => void;
}

export default function QuestionViewCard({
                                             question,
                                             index,
                                             onDeleteAction,
                                             onUpdatedAction,
                                         }: QuestionCardProps) {
    const options = question.options ?? [];
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (onDeleteAction) {
                await onDeleteAction(question.id);
            } else {
                await examService.deleteQuestion(question.id);
            }
        } finally {
            setIsDeleting(false);
            setDeleteOpen(false);
        }
    };

    const handleEditSubmit = () => {
        setEditOpen(false);
        onUpdatedAction?.();
    };

    return (
        <div>
            <Card className="w-full mx-auto overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg flex-1 min-w-0 break-words">
                            Question {index + 1}
                        </CardTitle>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditOpen(true)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div
                        className="font-medium text-base wrap-break-word leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                    />

                    <div className="space-y-2">
                        {options.map((option, optionIndex) => (
                            <div
                                key={option.id}
                                className={`p-3 rounded-lg border ${
                                    option.value
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50 border-gray-200"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <span className="font-medium text-sm shrink-0 mt-0.5">
                                            {String.fromCharCode(65 + optionIndex)}.
                                        </span>
                                        <span className="wrap-break-word leading-relaxed">
                                            {option.option}
                                        </span>
                                    </div>
                                    {option.value && (
                                        <Badge className="text-xs bg-green-600 shrink-0">
                                            Correct
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2 text-sm">
                                Explanation
                            </h4>
                            <p className="text-blue-800 text-sm leading-relaxed break-words">
                                {question.explanation}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                    </DialogHeader>
                    <EditQuestionForm
                        examId={Number(question.exam_id)}
                        questionId={question.id}
                        onSubmitAction={handleEditSubmit}
                    />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Question"
                description="Are you sure you want to delete this question? This action cannot be undone."
            />
        </div>
    );
}