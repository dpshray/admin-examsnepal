"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    CheckCircle,
    ImagePlus,
    Loader2,
    X,
} from "lucide-react";
import { RichTextEditor } from "@/components/field/rich-text-editor";
import FileInputField from "@/components/field/FileInputField";
import { examService } from "@/service/exam.service";
import { cn } from "@/lib/utils";
import TextInputField from "@/components/field/TextInputField";



type OptionKey = "A" | "B" | "C" | "D";
type OptionFieldName = "optionA" | "optionB" | "optionC" | "optionD";

interface QuestionOption {
    id: number;
    option: string;
    value: boolean;
}

interface QuestionDetails {
    id: number;
    question: string;
    explanation: string;
    options: QuestionOption[];
    image?: string;
}



const OPTIONS: { value: OptionKey; label: string; field: OptionFieldName }[] = [
    { value: "A", label: "Option A", field: "optionA" },
    { value: "B", label: "Option B", field: "optionB" },
    { value: "C", label: "Option C", field: "optionC" },
    { value: "D", label: "Option D", field: "optionD" },
];



const questionSchema = yup.object({
    question: yup.string().min(10).required(),
    optionA: yup.string().required(),
    optionB: yup.string().required(),
    optionC: yup.string().required(),
    optionD: yup.string().required(),
    correctAnswer: yup
        .mixed<OptionKey>()
        .oneOf(["A", "B", "C", "D"])
        .required("Select the correct answer"),
    explanation: yup.string().min(10).required(),
    questionImage: yup.mixed<File>().optional(),
});

type QuestionFormData = yup.InferType<typeof questionSchema>;



const ErrorMessage = ({ message }: { message?: string }) =>
    message ? (
        <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{message}</span>
        </div>
    ) : null;

const OptionField = ({
                         label,
                         value,
                         onChange,
                         error,
                     }: {
    label: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
}) => (
    <div className="mb-3">
        <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
        <textarea
            value={value ?? ""}
            onChange={onChange}
            className={cn(
                "w-full min-h-20 p-2 border rounded-md resize-none",
                error ? "border-red-500" : "border-gray-300"
            )}
        />
        <ErrorMessage message={error} />
    </div>
);

const CorrectAnswerRadio = ({
                                value,
                                label,
                                displayValue,
                                isSelected,
                                disabled,
                            }: {
    value: OptionKey;
    label: string;
    displayValue?: string;
    isSelected: boolean;
    disabled?: boolean;
}) => (
    <Label
        htmlFor={`answer-${value}`}
        className={cn(
            "flex gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
            isSelected ? "border-green-500 bg-green-50" : "border-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <RadioGroupItem
            id={`answer-${value}`}
            value={value}
            disabled={disabled}
        />

        <div className="flex-1">
            <span className="text-sm font-medium">{label}</span>
            {displayValue && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {displayValue}
                </p>
            )}
        </div>

        {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
    </Label>
);



export default function EditQuestionForm({
                                             questionId,
                                             onSubmitAction,
                                         }: {
    examId: number;
    questionId: number;
    onSubmitAction?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [optionIds, setOptionIds] = useState<Record<OptionKey, number>>({
        A: 0,
        B: 0,
        C: 0,
        D: 0,
    });

    const {
        control,
        handleSubmit,
        setValue,
        register,
        formState: { errors },
    } = useForm<QuestionFormData>({
        resolver: yupResolver(questionSchema) as any,
        defaultValues: {
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: undefined,
            explanation: "",
        },
    });

    const formValues = useWatch({ control });



    const { data, isLoading,refetch } = useQuery({
        queryKey: ["question", questionId],
        queryFn: async () => {
            const res = await examService.getQuestionById(questionId);
            console.log(res.data);
            return res.data as QuestionDetails;
        },
        enabled: !!questionId,
        refetchOnWindowFocus: true,
        gcTime: 0,
        staleTime: 0,

    });


    useEffect(() => {
        if (!data) return;

        setValue("question", data.question);
        setValue("explanation", data.explanation);

        const keys: OptionKey[] = ["A", "B", "C", "D"];
        const ids = { A: 0, B: 0, C: 0, D: 0 } as Record<OptionKey, number>;

        data.options.forEach((opt, i) => {
            const key = keys[i];
            setValue(`option${key}` as OptionFieldName, opt.option);
            ids[key] = opt.id;
            if (opt.value) setValue("correctAnswer", key);
        });

        setOptionIds(ids);

        if (data.image) {
            setExistingImageUrl(data.image);
            setShowImageUpload(true);
        }
    }, [data, setValue]);



    const handleImageChange = useCallback(
        (files: File[]) => {
            if (files?.[0]) setValue("questionImage", files[0]);
        },
        [setValue]
    );



    const onSubmit = async (values: QuestionFormData) => {
        setIsSubmitting(true);

        const fd = new FormData();
        fd.append("_method", "patch");
        fd.append("question", values.question);
        fd.append("explanation", values.explanation);
        fd.append("option_a", values.optionA);
        fd.append("option_b", values.optionB);
        fd.append("option_c", values.optionC);
        fd.append("option_d", values.optionD);
        fd.append("option_a_id", String(optionIds.A));
        fd.append("option_b_id", String(optionIds.B));
        fd.append("option_c_id", String(optionIds.C));
        fd.append("option_d_id", String(optionIds.D));
        fd.append("option_a_is_true", values.correctAnswer === "A" ? "1" : "0");
        fd.append("option_b_is_true", values.correctAnswer === "B" ? "1" : "0");
        fd.append("option_c_is_true", values.correctAnswer === "C" ? "1" : "0");
        fd.append("option_d_is_true", values.correctAnswer === "D" ? "1" : "0");

        if (values.questionImage) fd.append("image", values.questionImage);

        await examService.updateQuestion(questionId, fd);
        onSubmitAction?.();
        setIsSubmitting(false);
    };



    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
            </div>
        );
    }



    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/*<Controller*/}
            {/*    name="question"*/}
            {/*    control={control}*/}
            {/*    render={({ field }) => (*/}
            {/*        <RichTextEditor*/}
            {/*            content={field.value ?? ""}*/}
            {/*            onChange={field.onChange}*/}
            {/*        />*/}
            {/*    )}*/}
            {/*/>*/}
            {/*<ErrorMessage message={errors.question?.message} />*/}

            <TextInputField
                textarea
                {...register('question')}
                label={'Question'}
            />

            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowImageUpload(v => !v)}
            >
                {showImageUpload ? <X className="w-4 h-4" /> : <ImagePlus className="w-4 h-4" />}
            </Button>

            {showImageUpload && (
                <FileInputField
                    label="Question Image"
                    onFileChange={handleImageChange}
                    existingImageUrl={existingImageUrl}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3">
                    {OPTIONS.map(({ field, label }) => (
                        <Controller
                            key={field}
                            name={field}
                            control={control}
                            render={({ field: rhf }) => (
                                <OptionField
                                    label={label}
                                    value={rhf.value}
                                    onChange={rhf.onChange}
                                    error={errors[field]?.message}
                                />
                            )}
                        />
                    ))}
                </div>

                <div className="lg:col-span-2">
                    <Controller
                        name="correctAnswer"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="space-y-2"
                            >
                                {OPTIONS.map(o => (
                                    <CorrectAnswerRadio
                                        key={o.value}
                                        value={o.value}
                                        label={o.label}
                                        displayValue={formValues[o.field]}
                                        isSelected={field.value === o.value}
                                        disabled={!formValues[o.field]}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    />
                    <ErrorMessage message={errors.correctAnswer?.message} />
                </div>
            </div>

            <Controller
                name="explanation"
                control={control}
                render={({ field }) => (
                    <textarea
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full min-h-[100px] p-2 border rounded-md"
                    />
                )}
            />
            <ErrorMessage message={errors.explanation?.message} />

            <Button type="submit" disabled={isSubmitting} className={'justify-end'}>
                {isSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                    "Update Question"
                )}
            </Button>
        </form>
    );
}
