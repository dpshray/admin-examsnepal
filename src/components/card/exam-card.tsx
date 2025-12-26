"use client";

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {BookOpen, Eye, EyeOff, Pencil, Trash2, Upload} from "lucide-react";
import {memo, useCallback, useState} from "react";
import {DeleteDialog} from "@/components/modal/delete-model";
import {ExamModalForm} from "@/components/modal/exam-modal";
import {examService} from "@/service/exam.service";

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
    negative_marking?: number;
}

export interface ExamCardProps {
    id: number;
    publish: number;
    exam_type: ExamType;
    exam_name: string;
    total_questions: number;
    hasQuestions?: boolean;
    onUploadQuestions: (id: number) => void;
    description?: string;
    exam_type_id?: number;
    category_type?: CategoryType;
    assign?: number;
    live?: number;
    onDeleteAction?: () => void;
    onUpdatedAction?: () => void;
    negative_marking?: number;
}

export const ExamCard = memo(function ExamCard({
                                                   id,
                                                   publish,
                                                   exam_type,
                                                   exam_name,
                                                   total_questions,
                                                   negative_marking,
                                                   hasQuestions = false,
                                                   onUploadQuestions,
                                                   description,
                                                   exam_type_id,
                                                   category_type,
                                                   assign,
                                                   live,
                                                   onDeleteAction,
                                                   onUpdatedAction,
                                               }: ExamCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    const isPublished = Boolean(publish);
    const hasNegativeMarking = Boolean(negative_marking);

    const examData = {
        id,
        exam_name,
        description: description || "",
        exam_type_id: exam_type_id ?? exam_type.id,
        category_type: category_type?.id ?? 1,
        publish,
        assign: assign ?? 0,
        live: live ?? 0,
        negative_marking: negative_marking ?? 0,
    };

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

    return (
        <>
            <Card
                className="flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                role="article"
                aria-label={`Exam: ${exam_name}`}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <CardTitle
                            className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 break-words flex-1 min-w-0"
                            title={exam_name}
                        >
                            {exam_name}
                        </CardTitle>

                        <div className="flex items-center gap-2 shrink-0">
                            <Badge
                                variant={isPublished ? "default" : "secondary"}
                                className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
                                    isPublished ? "bg-green-500 hover:bg-green-600 text-white" : ""
                                }`}
                                aria-label={isPublished ? "Published status" : "Draft status"}
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
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pb-3">
                    <p
                        className="text-sm leading-relaxed text-muted-foreground line-clamp-3 break-words"
                        title={description || "No description available"}
                    >
                        {description || "No description available"}
                    </p>

                    <div className="space-y-2.5" role="list">
                        <InfoRow label="Type ID" value={exam_type.id.toString()}/>
                        <InfoRow label="Category" value={category_type?.name ?? "None"}/>
                        <InfoRow label="Exam Type" value={exam_type.name}/>
                        <InfoRow
                            label="Questions"
                            value={
                                <Badge
                                    variant={hasQuestions ? "default" : "outline"}
                                    className="text-xs font-medium"
                                >
                                    {hasQuestions ? "Available" : "None"}
                                </Badge>
                            }
                        />
                        <InfoRow label="Total Questions" value={total_questions.toString()}/>
                        <InfoRow
                            label="Negative Marking"
                            value={
                                <Badge
                                    variant={hasNegativeMarking ? "default" : "outline"}
                                    className="text-xs font-medium"
                                >
                                    {hasNegativeMarking ? "Enabled" : "Disabled"}
                                </Badge>
                            }
                        />
                    </div>
                </CardContent>

                <CardFooter className="pt-3">
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
                </CardFooter>
            </Card>

            <ExamModalForm
                isOpen={updateOpen}
                onClose={handleCloseUpdate}
                mode="update"
                initialData={examData}
                onSuccessAction={handleUpdateSuccess}
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

interface InfoRowProps {
    label: string;
    value: string | React.ReactNode;
}

const InfoRow = memo(function InfoRow({label, value}: InfoRowProps) {
    return (
        <div className="flex justify-between items-center text-xs sm:text-sm gap-2" role="listitem">
            <span className="text-muted-foreground whitespace-nowrap font-normal">{label}:</span>
            <span className="font-medium text-right wrap-break-word max-w-[60%] min-w-0 leading-snug">
                {value}
            </span>
        </div>
    );
});