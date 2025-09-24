"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, EyeOff, Pencil, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { DeleteDialog } from "../modal/delete-model";
import { ExamModal } from "../modal/exam-modal";

interface ExamType {
  id: number;
  name: string;
}

interface CategoryType {
  id: number;
  name: string;
}

interface ExamCardProps {
  id: number;
  // published: 0 | 1 | null;
  exam_type: ExamType;
  exam_name: string;
  total_questions: number;
  hasQuestions?: boolean;
  onUploadQuestions: (examId: string | number) => void;
  description?: string;
  exam_type_id?: number;
  category_type?: CategoryType;
  category_type_id?: number;
  onDelete?: (examId: number) => Promise<void>;
  publish: boolean;
  assign: boolean;
  live: boolean;
  onUpdated?: () => void;
}

export function ExamCard({
  id,
  publish,
  exam_type,
  exam_name,
  total_questions,
  hasQuestions = false,
  onUploadQuestions,
  description,
  exam_type_id,
  category_type,
  assign,
  live,
  onDelete,
  onUpdated,
}: ExamCardProps) {
  const isPublished = publish;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const examData = {
    id,
    exam_name,
    description,
    exam_type_id: exam_type_id ?? exam_type.id,
    category_type: category_type?.id ?? 1,
    // category_type,
    publish,
    assign: assign,
    live: live,
  };

  return (
    <div>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {exam_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Badge
                  variant="default"
                  className="flex items-center gap-1 bg-green-500"
                >
                  <Eye className="w-3 h-3" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Draft
                </Badge>
              )}
              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenUpdate(true)}
                >
                  <Pencil className="w-4 h-4 text-blue-600" />
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
              <span>{category_type?.name ?? "None"}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Exam Type:</span>
              <span>{exam_type.name}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Questions:</span>
              <Badge variant={hasQuestions ? "default" : "outline"}>
                {hasQuestions ? "Available" : "None"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Question:</span>
              <span>{total_questions}</span>
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
                <BookOpen className="w-4 h-4" />
                Manage Questions
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Questions
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <ExamModal
        isOpen={openUpdate}
        onClose={() => setOpenUpdate(false)}
        mode="update"
        initialData={examData}
        onSuccess={onUpdated}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (onDelete) {
            await onDelete(id);
          }
        }}
        title="Delete Exam"
        description={`Are you sure you want to delete "${exam_name}"? This action cannot be undone.`}
      />
    </div>
  );
}
