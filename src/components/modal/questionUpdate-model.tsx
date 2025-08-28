"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { examService } from "@/service/exam.service";
import TextInputField from "@/components/field/TextInputField";

const questionSchema = yup.object({
  question: yup.string().min(10).required(),
  optionA: yup.string().required(),
  optionB: yup.string().required(),
  optionC: yup.string().required(),
  optionD: yup.string().required(),
  correctAnswer: yup.string().oneOf(["A", "B", "C", "D"]).required(),
  explanation: yup.string().min(20).required(),
  questionImage: yup.mixed<File>().optional(),
});

export type QuestionFormData = yup.InferType<typeof questionSchema>;

const OPTIONS = [
  { value: "A", label: "Option A", field: "optionA" as const },
  { value: "B", label: "Option B", field: "optionB" as const },
  { value: "C", label: "Option C", field: "optionC" as const },
  { value: "D", label: "Option D", field: "optionD" as const },
];

interface UpdateQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  question: any | null;
  examId: number;
  onUpdated: () => void;
}

export default function UpdateQuestionDialog({
  open,
  onClose,
  question,
  onUpdated,
}: UpdateQuestionDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: yupResolver(questionSchema as any),
  });

  console.log("Editing Question:", question);

  useEffect(() => {
    if (question) {
        const correctIndex = question.options.findIndex((opt: any) => opt.value === 1);
        const correctLetter = (["A", "B", "C", "D"][correctIndex] || "A") as "A" | "B" | "C" | "D";

        reset({
            question: question.question || "",
            optionA: question.options[0]?.option || "",
            optionB: question.options[1]?.option || "",
            optionC: question.options[2]?.option || "",
            optionD: question.options[3]?.option || "",
            correctAnswer: correctLetter,
            explanation: question.explanation || "",
        });
    }
  }, [question, reset]);

  const onSubmit = async (data: QuestionFormData) => {
    if (!question) return;

    try {
      const formData = new FormData();
      formData.append("question", data.question);
      formData.append("option_a", data.optionA);
      formData.append("option_b", data.optionB);
      formData.append("option_c", data.optionC);
      formData.append("option_d", data.optionD);
      formData.append("option_a_is_true", data.correctAnswer === "A" ? "1" : "0");
      formData.append("option_b_is_true", data.correctAnswer === "B" ? "1" : "0");
      formData.append("option_c_is_true", data.correctAnswer === "C" ? "1" : "0");
      formData.append("option_d_is_true", data.correctAnswer === "D" ? "1" : "0");
      formData.append("explanation", data.explanation);

      if (data.questionImage instanceof File) {
        formData.append("image", data.questionImage);
      }

      await examService.updateQuestion(Number(question.id), formData);

      toast.success("Question updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update question");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Update Question</DialogTitle>
        </DialogHeader>

        {question && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                {...register("question")}
                placeholder="Enter your question"
                rows={4}
                className={errors.question ? "border-red-500" : ""}
              />
              {errors.question && (
                <p className="text-sm text-red-500">
                  {errors.question.message}
                </p>
              )}
            </div>
            {/* <TextInputField
              placeholder="Enter your question"
              error={errors.question?.message}
            /> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {OPTIONS.map(({ value, label, field }) => (
                  <TextInputField
                    key={value}
                    label={label}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    {...register(field)}
                    error={errors[field]?.message}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Correct Answer</Label>
                <RadioGroup
                  value={watch("correctAnswer")}
                  onValueChange={(val) =>
                    setValue("correctAnswer", val as any, { shouldValidate: true })
                  }
                >
                  {OPTIONS.map(({ value, label }) => (
                    <div
                      key={value}
                      className={`p-3 rounded flex justify-between items-center border ${
                        watch("correctAnswer") === value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={value} />
                        <Label>{label}</Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {errors.correctAnswer && (
                  <p className="text-sm text-red-500">
                    {errors.correctAnswer.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                {...register("explanation")}
                rows={4}
                className={errors.explanation ? "border-red-500" : ""}
              />
              {errors.explanation && (
                <p className="text-sm text-red-500">
                  {errors.explanation.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
