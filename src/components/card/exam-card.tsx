"use client";

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {BookOpen, Eye, EyeOff, Upload} from "lucide-react";

interface ExamType {
    id: number;
    name: string;
}

interface ExamCardProps {
    id: number;
    published: 0 | 1 | null;
    exam_type: ExamType;
    exam_name: string;
    total_questions: number;
    hasQuestions?: boolean;
    onUploadQuestions: (examId: string | number) => void;
    description?: string;
    exam_type_id?: number;
    category_type?: string;
}

export function ExamCard({
                             id,
                             published,
                             exam_type,
                             exam_name,
                             total_questions,
                             hasQuestions = false,
                             onUploadQuestions,
                             description,
                             exam_type_id,
                             category_type,
                         }: ExamCardProps) {
    const isPublished = published === 1;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{exam_name}</CardTitle>
                    <div className="flex items-center gap-2 ml-2">
                        {isPublished ? (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                                <Eye className="w-3 h-3"/>
                                Published
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <EyeOff className="w-3 h-3"/>
                                Draft
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {description || "No description available"}
                </p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Type ID:</span>
                        <span>{exam_type.id}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Category:</span>
                        <span>{category_type || exam_type.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>Questions:</span>
                        <Badge variant={hasQuestions ? "default" : "outline"}>
                            {hasQuestions ? "Available" : "None"}
                        </Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <Button
                    onClick={() => onUploadQuestions(id)}
                    className="w-full flex items-center gap-2 cursor-pointer"
                    variant={hasQuestions ? "outline" : "default"}
                >
                    {hasQuestions ? (
                        <>
                            <BookOpen className="w-4 h-4"/>
                            Manage Questions
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4"/>
                            Upload Questions
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
