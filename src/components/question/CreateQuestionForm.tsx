"use client";

import React from "react";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {CheckCircle, Loader2} from "lucide-react";
import {RichTextEditor} from "@/components/field/rich-text-editor";
import TextInputField from "@/components/field/TextInputField";
import {examService} from "@/service/exam.service";
import {cn} from "@/lib/utils";

const OPTIONS = [
    {value: "A", label: "Option A", field: "optionA"},
    {value: "B", label: "Option B", field: "optionB"},
    {value: "C", label: "Option C", field: "optionC"},
    {value: "D", label: "Option D", field: "optionD"},
] as const;

type OptionKey = "A" | "B" | "C" | "D";

const schema = yup.object({
    question: yup.string().required(),
    optionA: yup.string().required(),
    optionB: yup.string().required(),
    optionC: yup.string().required(),
    optionD: yup.string().required(),
    correctAnswer: yup.mixed<OptionKey>().oneOf(["A", "B", "C", "D"]).required(),
    explanation: yup.string().required(),
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
        formState: {isSubmitting},
    } = useForm<FormDataType>({
        resolver: yupResolver(schema),
        defaultValues: {
            correctAnswer: undefined,
        },
    });

    const options = watch(["optionA", "optionB", "optionC", "optionD"]);

    const onSubmit = async (data: FormDataType) => {
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
        await examService.uploadQuestion(examId, formData);
        reset();
        onSubmitAction?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
                name="question"
                control={control}
                render={({field}) => (
                    <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Write your question..."
                    />
                )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-3">
                    {OPTIONS.map(({field, label}) => (
                        <TextInputField
                            key={field}
                            label={label}
                            {...register(field)}
                            textarea
                        />
                    ))}
                </div>

                <div className="lg:col-span-2">
                    <Controller
                        name="correctAnswer"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="space-y-2"
                            >
                                {OPTIONS.map(({value, label}, index) => (
                                    <label
                                        key={value}
                                        htmlFor={`answer-${value}`}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer",
                                            field.value === value
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200"
                                        )}
                                    >
                                        <RadioGroupItem id={`answer-${value}`} value={value}/>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium">{label}</span>
                                            {options[index] && (
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    {options[index]}
                                                </p>
                                            )}
                                        </div>
                                        {field.value === value && (
                                            <CheckCircle className="w-4 h-4 text-green-600"/>
                                        )}
                                    </label>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            <TextInputField
                label="Explanation"
                {...register("explanation")}
                textarea
            />

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin"/>
                ) : (
                    "Create Question"
                )}
            </Button>
        </form>
    );
}
