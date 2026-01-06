"use client";

import React, {useCallback, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {CheckCircle, ImagePlus, Loader2, X, AlertCircle} from "lucide-react";
import {RichTextEditor} from "@/components/field/rich-text-editor";
import TextInputField from "@/components/field/TextInputField";
import {examService} from "@/service/exam.service";
import {cn} from "@/lib/utils";
import {Label} from "@/components/ui/label";
import FileInputField from "@/components/field/FileInputField";

const OPTIONS = [
    {value: "A", label: "Option A", field: "optionA"},
    {value: "B", label: "Option B", field: "optionB"},
    {value: "C", label: "Option C", field: "optionC"},
    {value: "D", label: "Option D", field: "optionD"},
] as const;

type OptionKey = "A" | "B" | "C" | "D";

const schema = yup.object({
    question: yup.string().required("Question is required"),
    optionA: yup.string().required("Option A is required"),
    optionB: yup.string().required("Option B is required"),
    optionC: yup.string().required("Option C is required"),
    optionD: yup.string().required("Option D is required"),
    correctAnswer: yup.mixed<OptionKey>().oneOf(["A", "B", "C", "D"]).required("Please select the correct answer"),
    explanation: yup.string().required("Explanation is required"),
    questionImage: yup.mixed<File>().optional(),
});

type FormDataType = yup.InferType<typeof schema>;

export default function CreateQuestionForm({
                                               examId,
                                               onSubmitAction,
                                           }: {
    examId: number;
    onSubmitAction?: () => void;
}) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: {isSubmitting, errors},
    } = useForm<FormDataType>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            correctAnswer: undefined,
        },
    });
    const [showImageUpload, setShowImageUpload] = useState(false);

    const options = watch(["optionA", "optionB", "optionC", "optionD"]);
    const correctAnswer = watch("correctAnswer");

    const handleImageChange = useCallback(
        (files: File[]) => {
            if (files?.[0]) setValue("questionImage", files[0]);
        },
        [setValue]
    );

    const onSubmit = async (data: FormDataType) => {
        try {
            const formData = new FormData();
            formData.append("question", data.question);
            formData.append("option_a", data.optionA);
            formData.append("option_b", data.optionB);
            formData.append("option_c", data.optionC);
            formData.append("option_d", data.optionD);
            formData.append("explanation", data.explanation);
            formData.append("option_a_is_true", String(data.correctAnswer === "A"));
            formData.append("option_b_is_true", String(data.correctAnswer === "B"));
            formData.append("option_c_is_true", String(data.correctAnswer === "C"));
            formData.append("option_d_is_true", String(data.correctAnswer === "D"));
            if (data.questionImage) formData.append("question_image", data.questionImage);

            await examService.uploadQuestion(examId, formData);
            reset();
            setShowImageUpload(false);
            onSubmitAction?.();
        } catch (error) {
            console.error("Failed to create question:", error);
        }
    };

    return (
        <div className="w-full ">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Question</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Fill in the details to add a question to the exam</p>
                </div>

                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    <div className="space-y-3">
                        {/*<Label className="text-sm sm:text-base font-semibold text-gray-900">*/}
                        {/*    Question <span className="text-red-500">*</span>*/}
                        {/*</Label>*/}
                        {/*<Controller*/}
                        {/*    name="question"*/}
                        {/*    control={control}*/}
                        {/*    render={({field}) => (*/}
                        {/*        <div>*/}
                        {/*            <RichTextEditor*/}
                        {/*                content={field.value}*/}
                        {/*                onChange={field.onChange}*/}
                        {/*                placeholder="Write your question here..."*/}
                        {/*                minHeight="150px"*/}
                        {/*            />*/}
                        {/*            {errors.question && (*/}
                        {/*                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">*/}
                        {/*                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />*/}
                        {/*                    {errors.question.message}*/}
                        {/*                </p>*/}
                        {/*            )}*/}
                        {/*        </div>*/}
                        {/*    )}*/}
                        {/*/>*/}

                        <TextInputField
                            textarea
                            {...register('question')}
                            label={'Question'}
                        />
                        <div className="pt-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setShowImageUpload(v => !v)}
                                className="gap-2 text-xs sm:text-sm"
                            >
                                {showImageUpload ? (
                                    <>
                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Remove Image
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Add Image to Question
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
                    </div>



                    <div className="border-t border-gray-200"></div>

                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
                            Answer Options <span className="text-red-500">*</span>
                        </h3>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                            <div className="xl:col-span-2 space-y-3 sm:space-y-4">
                                {OPTIONS.map(({field, label}) => (
                                    <div key={field}>
                                        <TextInputField
                                            label={label}
                                            {...register(field)}
                                            textarea
                                            rows={2}
                                        />
                                        {errors[field] && (
                                            <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors[field]?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="xl:col-span-1">
                                <div className="xl:sticky xl:top-4">
                                    <Label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 block">
                                        Select Correct Answer <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="correctAnswer"
                                        control={control}
                                        render={({field}) => (
                                            <div>
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className="space-y-2"
                                                >
                                                    {OPTIONS.map(({value, label}, index) => (
                                                        <div
                                                            key={value}
                                                            // htmlFor={`answer-${value}`}
                                                            className={cn(
                                                                "flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all",
                                                                field.value === value
                                                                    ? "border-green-500 bg-green-50 shadow-sm"
                                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <RadioGroupItem
                                                                id={`answer-${value}`}
                                                                value={value}
                                                                className="mt-0.5"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-xs sm:text-sm font-medium text-gray-900 block mb-1">
                                                                    {label}
                                                                </span>
                                                                {options[index] && (
                                                                    <p className="text-xs text-gray-600 line-clamp-2 break-words">
                                                                        {options[index]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {field.value === value && (
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                                {errors.correctAnswer && (
                                                    <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {errors.correctAnswer.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    <div>
                        <TextInputField
                            label="Explanation"
                            {...register("explanation")}
                            textarea
                            rows={8}
                            className="min-h-45"
                            placeholder="Provide a detailed explanation for the correct answer..."
                        />
                        {errors.explanation && (
                            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                {errors.explanation.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                        {correctAnswer ? (
                            <span className="text-green-600 font-medium">
                                ✓ Correct answer: Option {correctAnswer}
                            </span>
                        ) : (
                            "Please fill all required fields"
                        )}
                    </p>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[140px] sm:min-w-[160px] gap-2"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Question"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}