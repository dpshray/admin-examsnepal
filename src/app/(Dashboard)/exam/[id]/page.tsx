"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import QuestionCard from "@/components/card/question-card";
import { examService } from "@/service/exam.service";
import CustomPagination from "@/components/Custom-Pagination";
import FileInputField from "@/components/field/FileInputField";
import { toast } from "sonner";
import TextInputField from "@/components/field/TextInputField";

const questionSchema = yup.object({
  question: yup
    .string()
    .min(10, "Question must be at least 10 characters")
    .required("Question is required"),
  optionA: yup.string().required("Option A is required"),
  optionB: yup.string().required("Option B is required"),
  optionC: yup.string().required("Option C is required"),
  optionD: yup.string().required("Option D is required"),
  correctAnswer: yup
    .string()
    .oneOf(["A", "B", "C", "D"], "Please select the correct answer")
    .required("Correct answer is required"),
  explanation: yup
    .string()
    .min(20, "Explanation must be at least 20 characters")
    .required("Explanation is required"),
  questionImage: yup.mixed<File>().optional(),
});

type QuestionFormData = yup.InferType<typeof questionSchema>;

const OPTIONS = [
  { value: "A", label: "Option A", field: "optionA" as keyof QuestionFormData },
  { value: "B", label: "Option B", field: "optionB" as keyof QuestionFormData },
  { value: "C", label: "Option C", field: "optionC" as keyof QuestionFormData },
  { value: "D", label: "Option D", field: "optionD" as keyof QuestionFormData },
];



interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "multiple-choice" | "true-false" | "essay";
}

interface Exam {
  id: string | number;
  exam_type_id: number;
  category_type: number;
  exam_name: string;
  description: string;
  publish: boolean;
  hasQuestions?: boolean;
  is_active: boolean;
  exam_type: {
    name: string;
  };
}

export default function ExamQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    reset,
  } = useForm<QuestionFormData>({
    resolver: yupResolver(questionSchema as any),
    mode: "onChange",
  });

  const watchedValues = watch();
  const correctAnswer = watch("correctAnswer") || "";

  const fetchExamData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await examService.getExamById(examId, page);
        console.log("Fetched exam data:", response);
        setTotal(response?.questions?.total ?? 0);
        setExam(response?.exam ?? null);
        setQuestions(response?.questions?.data ?? []);
        setCurrentPage(response?.questions?.current_page ?? 1);
        setTotalPages(response?.questions?.last_page ?? 1);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [examId]
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchExamData(page);
  };

  useEffect(() => {
    fetchExamData(currentPage);
  }, [fetchExamData, currentPage]);

  const handleGoBack = () => {
    router.back();
  };

  const handleUploadQuestions = () => {
    console.log("Upload questions functionality");
  };

  const handleAddQuestion = () => {
    setShowAddForm(true);
  };

  const handleDeleteQuestion = async (id: number) => {
    try {
      await examService.deleteQuestion(id);
      toast.success("Question deleted successfully");
      fetchExamData();
    } catch (error) {
      toast.error("Failed to delete question");
      console.error(error);
    }
  };

  const uploadQuestion = async (data: QuestionFormData) => {
    if (!exam) return;

    try {
      const formData = new FormData();
      formData.append("question", data.question);
      formData.append("option_a", data.optionA);
      formData.append("option_b", data.optionB);
      formData.append("option_c", data.optionC);
      formData.append("option_d", data.optionD);
      formData.append(
        "option_a_is_true",
        data.correctAnswer === "A" ? "1" : "0"
      );
      formData.append(
        "option_b_is_true",
        data.correctAnswer === "B" ? "1" : "0"
      );
      formData.append(
        "option_c_is_true",
        data.correctAnswer === "C" ? "1" : "0"
      );
      formData.append(
        "option_d_is_true",
        data.correctAnswer === "D" ? "1" : "0"
      );
      formData.append("explanation", data.explanation);

      if (data.questionImage instanceof File) {
        formData.append("image", data.questionImage);
      }

      const response = await examService.uploadQuestion(
        Number(exam.id),
        formData
      );
      console.log(" Response add question:", response);
      await fetchExamData();
      setShowAddForm(false);
      reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading question:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    reset();
    setImagePreview(null);
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("questionImage", undefined, { shouldValidate: true });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  console.log("Exam data:", exam?.description);

  if (!exam) {
    return (
      <main className="min-h-screen w-full bg-gray-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Exam Not Found
          </h1>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 w-full">
      <header className="mb-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 capitalize">
              {exam.exam_name}
            </h1>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {exam.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={exam.is_active ? "default" : "secondary"}>
                {exam.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">{exam.exam_type.name}</Badge>
              <span className="text-sm text-gray-500">
                {/* {questions.length} question{questions.length !== 1 ? "s" : ""} */}
                {total} question{total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleUploadQuestions}
              variant="outline"
              className="flex items-center gap-1 justify-center"
            >
              <Upload className="w-4 h-4" />
              Upload Questions
            </Button>
            <Button
              onClick={handleAddQuestion}
              className="flex items-center gap-1 justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        </div>
      </header>

      {showAddForm && (
        <section className="mb-8">
          <Card className="w-full p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Add Question</h2>
              <p className="text-muted-foreground">
                Create a new multiple choice question for your exam.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(uploadQuestion)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium">Question</Label>
                <Textarea
                  placeholder="Enter your question (minimum 10 characters)"
                  {...register("question")}
                  rows={4}
                  // error={errors.question?.message}
                  className={errors.question ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.question && (
                  <p className="text-sm text-red-500">
                    {errors.question.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Question Image (Optional)
                </Label>
                {!imagePreview ? (
                  <FileInputField
                    label="Upload an image"
                    required
                    accept="image/*"
                    placeholder="Upload your profile picture"
                    {...register("questionImage")}
                  />
                ) : (
                  <div className="relative border rounded-lg p-4 bg-gray-50 flex items-start gap-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="max-h-48 object-contain border rounded"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {OPTIONS.map(({ value, label, field }) => (
                    <TextInputField
                      key={value}
                      label={label}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      {...register(field)}
                      error={errors[field]?.message}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Choose Correct Answer
                  </Label>
                  <RadioGroup
                    value={correctAnswer}
                    onValueChange={(value) =>
                      setValue(
                        "correctAnswer",
                        value as QuestionFormData["correctAnswer"],
                        { shouldValidate: true }
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {OPTIONS.map(({ value, label }) => {
                      const key = `option${value}` as keyof QuestionFormData;
                      const displayValue =
                        typeof watchedValues[key] === "string"
                          ? watchedValues[key]
                          : "";
                      const isSelected = correctAnswer === value;

                      return (
                        <div
                          key={value}
                          className={`p-3 rounded flex justify-between items-center transition-colors
                                ${
                                  isSelected
                                    ? "border-2 border-green-500 bg-green-50"
                                    : "border border-gray-300 hover:border-gray-400"
                                }`}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={value} />
                            <Label
                              className={`${
                                isSelected
                                  ? "text-green-700 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {label}
                            </Label>
                          </div>
                          <span
                            className={`text-sm ${
                              isSelected
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {errors.correctAnswer && (
                    <p className="text-sm text-red-500">
                      {errors.correctAnswer.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Explanation</Label>
                <Textarea
                  {...register("explanation")}
                  rows={4}
                  disabled={isSubmitting}
                  className={errors.explanation ? "border-red-500" : ""}
                />
                {errors.explanation && (
                  <p className="text-sm text-red-500">
                    {errors.explanation.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Adding...
                    </>
                  ) : (
                    "Add Question"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </section>
      )}

      <section>
        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <QuestionCard
                key={String(question.id)}
                question={question as any}
                index={index}
                onDelete={handleDeleteQuestion}
                onUpdated={fetchExamData}
              />
            ))}
            <div>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChangeAction={handlePageChange}
              />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload questions or create them manually
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUploadQuestions}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                <Button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
