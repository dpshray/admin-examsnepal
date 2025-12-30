"use client";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {BookOpen, Eye, EyeOff, Pencil, Trash2, Upload} from "lucide-react";
import {memo, useCallback, useMemo, useState} from "react";
import {DeleteDialog} from "@/components/modal/delete-model";
import {examService} from "@/service/exam.service";
import {ExamModalForm} from "@/components/Exam/exam-modal-form";

export interface ExamType {
    id: number;
    name: string;
}

export interface CategoryType {
    id: number;
    name: "FREE_QUIZ" | string;
}

export interface Exam {
    id: number;
    published: number;
    exam_type: ExamType;
    category_type: CategoryType;
    exam_name: string;
    live: number;
    description: string;
    assign: number;
    total_questions: number;
    is_negative_marking?: boolean;
    negative_marking_point?: number;
    points_per_question: number;
    duration?: number;
}

export interface ExamCardProps {
    exams: Exam;
    onDeleteAction?: () => void;
    onUpdatedAction?: () => void;
    onUploadQuestions: (id: number) => void;
}

const InfoRow = memo(function InfoRow({label, value}: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex justify-between items-center text-xs sm:text-sm gap-2" role="listitem">
            <span className="text-muted-foreground whitespace-nowrap font-normal">{label}:</span>
            <span className="font-medium text-right break-words max-w-[60%] min-w-0 leading-snug">
                {value}
            </span>
        </div>
    );
});

export const ExamCard = memo(function ExamCard({
                                                   exams,
                                                   onDeleteAction,
                                                   onUpdatedAction,
                                                   onUploadQuestions,
                                               }: ExamCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    const {
        id,
        published,
        exam_type,
        exam_name,
        total_questions,
        is_negative_marking,
        negative_marking_point,
        points_per_question,
        description,
        category_type,
        duration
    } = exams;

    const isPublished = useMemo(() => Boolean(published), [published]);
    const hasNegativeMarking = useMemo(() => Boolean(is_negative_marking), [is_negative_marking]);
    const hasQuestions = useMemo(() => total_questions > 0, [total_questions]);

    const handleDelete = useCallback(async () => {
        try {
            await examService.deleteExam(id);
            onDeleteAction?.();
        } catch (error) {
            console.error("Failed to delete exam:", error);
            throw error;
        }
    }, [id, onDeleteAction]);

    const handleUpdateSuccess = useCallback(() => {
        setUpdateOpen(false);
        onUpdatedAction?.();
    }, [onUpdatedAction]);

    const handleOpenUpdate = useCallback(() => setUpdateOpen(true), []);
    const handleOpenDelete = useCallback(() => setDeleteOpen(true), []);
    const handleCloseUpdate = useCallback(() => setUpdateOpen(false), []);
    const handleUploadQuestions = useCallback(() => onUploadQuestions(id), [id, onUploadQuestions]);

    const publishBadgeClasses = useMemo(() =>
        `flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
            isPublished ? "bg-green-500 hover:bg-green-600 text-white" : ""
        }`, [isPublished]
    );

    return (
        <>
            <article
                className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
                role="article"
                aria-labelledby={`exam-title-${id}`}
            >
                <header className="p-3 sm:p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-3">
                        <h3
                            id={`exam-title-${id}`}
                            className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 break-words flex-1 min-w-0 text-gray-900 dark:text-gray-100"
                        >
                            {exam_name}
                        </h3>

                        <div className="flex items-center gap-2 shrink-0">
                            <Badge
                                variant={isPublished ? "default" : "secondary"}
                                className={publishBadgeClasses}
                                aria-label={isPublished ? "Published" : "Draft"}
                            >
                                {isPublished ? (
                                    <>
                                        <Eye className="w-3 h-3" aria-hidden="true"/>
                                        <span className="hidden sm:inline">Published</span>
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-3 h-3" aria-hidden="true"/>
                                        <span className="hidden sm:inline">Draft</span>
                                    </>
                                )}
                            </Badge>

                            <div className="flex gap-1" role="group" aria-label="Exam actions">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    onClick={handleOpenUpdate}
                                    aria-label={`Edit ${exam_name}`}
                                >
                                    <Pencil className="w-4 h-4 text-blue-600" aria-hidden="true"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={handleOpenDelete}
                                    aria-label={`Delete ${exam_name}`}
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-3 sm:p-4 space-y-4">
                    <p
                        className="text-sm leading-relaxed text-muted-foreground line-clamp-3 wrap-break-word"
                        aria-label="Exam description"
                    >
                        {description || "No description available"}
                    </p>

                    <div className="space-y-2.5" role="list" aria-label="Exam details">
                        <InfoRow
                            label="Duration (Minutes)"
                            value={duration !== null && duration !== undefined ? `${duration} Min` : "N/A"}
                        />

                        <InfoRow label="Type ID" value={exam_type.id.toString()}/>
                        <InfoRow label="Category" value={category_type?.name ?? "None"}/>
                        <InfoRow label="Exam Type" value={exam_type.name}/>
                        <InfoRow
                            label="Questions"
                            value={
                                <Badge
                                    variant={hasQuestions ? "default" : "outline"}
                                    className="text-xs font-medium"
                                    aria-label={hasQuestions ? "Questions available" : "No questions"}
                                >
                                    {hasQuestions ? "Available" : "None"}
                                </Badge>
                            }
                        />
                        <InfoRow label="Total Questions" value={total_questions.toString()}/>
                        <InfoRow
                            label="Points Per Question"
                            value={points_per_question?.toString() ?? "N/A"}
                        />
                        <InfoRow
                            label="Negative Marking"
                            value={
                                <Badge
                                    variant={hasNegativeMarking ? "default" : "outline"}
                                    className="text-xs font-medium"
                                    aria-label={hasNegativeMarking ? "Negative marking enabled" : "Negative marking disabled"}
                                >
                                    {hasNegativeMarking ? "Enabled" : "Disabled"}
                                </Badge>
                            }
                        />
                        {hasNegativeMarking && negative_marking_point !== undefined && (
                            <InfoRow
                                label="Negative Points"
                                value={negative_marking_point.toString()}
                            />
                        )}
                    </div>
                </div>

                <footer className="p-3 sm:p-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        onClick={handleUploadQuestions}
                        className="w-full flex items-center justify-center gap-2 font-medium"
                        variant={hasQuestions ? "outline" : "default"}
                        aria-label={hasQuestions ? `Manage questions for ${exam_name}` : `Upload questions for ${exam_name}`}
                    >
                        {hasQuestions ? (
                            <>
                                <BookOpen className="w-4 h-4" aria-hidden="true"/>
                                <span>Manage Questions</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" aria-hidden="true"/>
                                <span>Upload Questions</span>
                            </>
                        )}
                    </Button>
                </footer>
            </article>

            <ExamModalForm
                isOpen={updateOpen}
                onClose={handleCloseUpdate}
                mode="update"
                onSuccessAction={handleUpdateSuccess}
                examId={exams.id}
            />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Exam"
                description="Are you sure you want to delete this exam? This action cannot be undone."
                itemName={exam_name}
            />
        </>
    );
});