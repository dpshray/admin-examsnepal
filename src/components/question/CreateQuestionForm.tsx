"use client";

import React, { useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, ImagePlus, Loader2, X } from "lucide-react";
import { RichTextEditor } from "@/components/field/rich-text-editor";
import TextInputField from "@/components/field/TextInputField";
import FileInputField from "@/components/field/FileInputField";
import { examService } from "@/service/exam.service";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { value: "A", label: "Option A", field: "optionA" },
    { value: "B", label: "Option B", field: "optionB" },
    { value: "C", label: "Option C", field: "optionC" },
    { value: "D", label: "Option D", field: "optionD" },
] as const;
type OptionKey = "A" | "B" | "C" | "D";

const questionSchema = yup.object({
    question: yup.string().min(10, "Question must be at least 10 characters").required("Question is required"),
    optionA: yup.string().required("Option A is required"),
    optionB: yup.string().required("Option B is required"),
    optionC: yup.string().required("Option C is required"),
    optionD: yup.string().required("Option D is required"),
    correctAnswer: yup.string().oneOf(["A", "B", "C", "D"], "Please select a correct answer").required("Correct answer is required"),
    explanation: yup.string().min(10, "Explanation must be at least 10 characters").required("Explanation is required"),
    questionImage: yup.mixed<File>().optional(),
});

type QuestionFormData = yup.InferType<typeof questionSchema>;

interface CreateQuestionFormProps {
    examId: number;
    onSubmitAction?: () => void;
}

const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
};

const OptionField = ({ field, label, register, error, disabled }: any) => (
    <div className="mb-3">
        <TextInputField
            label={label}
            placeholder="Enter your option"
            {...register(field)}
            disabled={disabled}
            error={error}
            textarea
        />
    </div>
);

const CorrectAnswerRadio = ({
                                value,
                                label,
                                displayValue,
                                isSelected,
                                onSelect,
                                disabled,
                            }: any) => (
    <div
        onClick={disabled ? undefined : onSelect}
        onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelect();
            }
        }}
        role="radio"
        aria-checked={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
            "p-3 rounded-lg border-2 transition-all duration-200",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            isSelected
                ? "border-green-500 bg-green-50 shadow-sm"
                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        )}
    >
        <div className="flex items-start gap-2.5">
            <RadioGroupItem value={value} className="mt-0.5" disabled={disabled} />
            <div className="flex-1 min-w-0">
                <Label className={cn("font-medium text-sm", !disabled && "cursor-pointer")}>{label}</Label>
                {displayValue && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 break-words">{displayValue}</p>
                )}
            </div>
            {isSelected && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-label="Selected" />}
        </div>
    </div>
);

export default function CreateQuestionForm({ examId, onSubmitAction }: CreateQuestionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<QuestionFormData>({
        resolver: yupResolver(questionSchema) as any,
        mode: "onBlur",
    });

    const correctAnswer = watch("correctAnswer");

    const handleImageChange = useCallback(
        (files: File[]) => {
            if (files && files[0]) {
                setValue("questionImage", files[0]);
            }
        },
        [setValue]
    );

    const onSubmit = async (data: QuestionFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("question", data.question);
            formData.append("option_a", data.optionA);
            formData.append("option_b", data.optionB);
            formData.append("option_c", data.optionC);
            formData.append("option_d", data.optionD);
            formData.append("explanation", data.explanation);

            if (data.questionImage) {
                formData.append("image", data.questionImage);
            }

            formData.append("option_a_is_true", correctAnswer === "A" ? "1" : "0");
            formData.append("option_b_is_true", correctAnswer === "B" ? "1" : "0");
            formData.append("option_c_is_true", correctAnswer === "C" ? "1" : "0");
            formData.append("option_d_is_true", correctAnswer === "D" ? "1" : "0");

            await examService.uploadQuestion(examId, formData);

            reset();
            setShowImageUpload(false);
            onSubmitAction?.();
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-7xl mx-auto" noValidate>
            <div>
                <Label htmlFor="question" className="text-sm font-medium mb-1.5 block">
                    Question <span className="text-red-500">*</span>
                </Label>
                <Controller
                    name="question"
                    control={control}
                    render={({ field }) => <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Write your question..."
                        className={cn(errors.question?.message && "border-destructive")}
                    />}
                />
                <ErrorMessage message={errors.question?.message} />
            </div>

            <div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="gap-1.5"
                    disabled={isSubmitting}
                >
                    {showImageUpload ? (
                        <>
                            <X className="w-4 h-4" aria-hidden="true" />
                            Remove Image
                        </>
                    ) : (
                        <>
                            <ImagePlus className="w-4 h-4" aria-hidden="true" />
                            Add Image
                        </>
                    )}
                </Button>

                {showImageUpload && (
                    <div className="mt-3">
                        <FileInputField
                            label="Question Image"
                            onFileChange={handleImageChange}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
                <div className="lg:col-span-3 space-y-1">
                    <h3 className="text-sm font-medium mb-2">
                        Answer Options <span className="text-red-500">*</span>
                    </h3>
                    {OPTIONS.map(({ field, label }) => (
                        <OptionField
                            key={field}
                            field={field}
                            label={label}
                            register={register}
                            error={errors[field as keyof QuestionFormData]?.message}
                            disabled={isSubmitting}
                        />
                    ))}
                </div>

                <div className="lg:col-span-2">
                    <fieldset>
                        <legend className="text-sm font-medium mb-2">
                            Correct Answer <span className="text-red-500">*</span>
                        </legend>
                        <RadioGroup value={correctAnswer} className="space-y-2">
                            {OPTIONS.map(({ value, label, field }) => (
                                <CorrectAnswerRadio
                                    key={value}
                                    value={value}
                                    label={label}
                                    displayValue={watch(field)}
                                    isSelected={correctAnswer === value}
                                    onSelect={() => setValue("correctAnswer", value, { shouldValidate: true })}
                                    disabled={isSubmitting}
                                />
                            ))}
                        </RadioGroup>
                        <ErrorMessage message={errors.correctAnswer?.message} />
                    </fieldset>
                </div>
            </div>

            <div>
                <TextInputField
                    label="Explanation"
                    placeholder="Provide detailed explanation for the correct answer"
                    {...register("explanation")}
                    textarea
                    disabled={isSubmitting}
                />
                <ErrorMessage message={errors.explanation?.message} />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="min-w-32">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4 mr-2" aria-hidden="true" />
                            Creating...
                        </>
                    ) : (
                        "Create Question"
                    )}
                </Button>
            </div>
        </form>
    );
}