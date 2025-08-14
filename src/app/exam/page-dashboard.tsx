"use client"

import React, {useId, useState} from "react"
import {SubmitHandler, useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"

import {Badge} from "@/components/ui/badge"
import {Label} from "@/components/ui/label"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {Card} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {ImageIcon, Loader2, Upload, X} from "lucide-react"
import TextInputField from "@/components/field/TextInputField"
import Image from "next/image";

interface QuestionFormData {
    question: string
    questionImage?: FileList | undefined  // Explicitly allow undefined for compatibility
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctAnswer: "A" | "B" | "C" | "D"
    explanation: string
}

const questionSchema: yup.Schema<QuestionFormData> = yup
    .object({
        question: yup.string().required("Question is required").min(10, "Question must be at least 10 characters"),
        questionImage: yup.mixed<FileList>().optional(),
        optionA: yup.string().required("Option A is required").min(1, "Option A cannot be empty"),
        optionB: yup.string().required("Option B is required").min(1, "Option B cannot be empty"),
        optionC: yup.string().required("Option C is required").min(1, "Option C cannot be empty"),
        optionD: yup.string().required("Option D is required").min(1, "Option D cannot be empty"),
        correctAnswer: yup.string().oneOf(["A", "B", "C", "D"]).required("Please select the correct answer"),
        explanation: yup.string().required("Explanation is required").min(20, "Explanation must be at least 20 characters"),
    })
    .required()

const OPTIONS = [
    {value: "A", label: "Option A", field: "optionA" as keyof QuestionFormData},
    {value: "B", label: "Option B", field: "optionB" as keyof QuestionFormData},
    {value: "C", label: "Option C", field: "optionC" as keyof QuestionFormData},
    {value: "D", label: "Option D", field: "optionD" as keyof QuestionFormData},
] as const

export default function AddQuestionPageWithImage() {
    const id = useId()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: {errors, isValid},
    } = useForm<QuestionFormData>({
        resolver: yupResolver(questionSchema as any),
        defaultValues: {correctAnswer: "A"},
        mode: "onChange",
    })

    const watchedValues = watch()
    const correctAnswer = watch("correctAnswer")

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files[0]) {
            const file = files[0]

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB")
                return
            }
            const reader = new FileReader()
            reader.onload = (e) => setImagePreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        setValue("questionImage", undefined)
        const fileInput = document.getElementById(`${id}-image`) as HTMLInputElement | null
        if (fileInput) fileInput.value = ""
    }

    const onSubmit: SubmitHandler<QuestionFormData> = async (data) => {
        setIsSubmitting(true)
        try {
            console.log("Submitting question:", data)
            if (data.questionImage && data.questionImage.length > 0)
                console.log("Question includes image:", data.questionImage[0].name)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            reset()
            setImagePreview(null)
            alert("Question added successfully!")
        } catch {
            alert("Failed to add question. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        reset()
        setImagePreview(null)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Add Question</h1>
                <p className="text-muted-foreground">Create a new multiple choice question for your exam.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <TextInputField
                    label="Question"
                    placeholder="Enter your question (minimum 10 characters)"
                    {...register("question")}
                    error={errors.question?.message}
                    disabled={isSubmitting}
                    id={`${id}-question`}
                />

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-image`} className="text-sm font-medium">
                            Question Image (Optional)
                        </Label>
                        <p className="text-xs text-muted-foreground">Upload an image if your question requires visual
                            context. Max size: 5MB</p>
                    </div>

                    {!imagePreview ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-gray-400"/>
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor={`${id}-image`}
                                        className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Click to upload image
                                    </Label>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            </div>
                            <Input
                                id={`${id}-image`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("questionImage")}
                                onChange={handleImageChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    ) : (
                        <div className="relative border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <ImageIcon className="h-8 w-8 text-gray-400"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Image
                                        width={128}
                                        height={128}
                                        src={imagePreview}
                                        alt="Question preview"
                                        className="max-w-full h-auto max-h-48 rounded border object-contain"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeImage}
                                    disabled={isSubmitting}
                                    className="flex-shrink-0"
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Answer Options</Label>
                            <p className="text-xs text-muted-foreground">Enter the four possible answers for this
                                question.</p>
                        </div>

                        <div className="space-y-4">
                            {OPTIONS.map(({value, label, field}) => (
                                <TextInputField
                                    key={value}
                                    label={label}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    {...register(field)}
                                    error={errors[field]?.message}
                                    disabled={isSubmitting}
                                    id={`${id}-${value}-option`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium leading-none">Choose Correct Answer</legend>
                            <p className="text-xs text-muted-foreground">Select which option is the correct answer.</p>

                            <RadioGroup
                                className="gap-0 -space-y-px rounded-md shadow-sm"
                                value={correctAnswer}
                                onValueChange={(value) =>
                                    setValue("correctAnswer", value as QuestionFormData["correctAnswer"], {shouldValidate: true})
                                }
                                disabled={isSubmitting}
                            >
                                {OPTIONS.map(({value, label, field}) => (
                                    <div
                                        key={`${id}-${value}`}
                                        className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex flex-col gap-4 border p-4 outline-none first:rounded-t-md last:rounded-b-md has-data-[state=checked]:z-10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    id={`${id}-${value}`}
                                                    value={value}
                                                    className="after:absolute after:inset-0"
                                                    aria-describedby={`${id}-${value}-text`}
                                                />
                                                <Label className="inline-flex items-start cursor-pointer"
                                                       htmlFor={`${id}-${value}`}>
                                                    {label}
                                                    {correctAnswer === value && (
                                                        <Badge
                                                            className="ms-2 -mt-1 bg-green-500 hover:bg-green-600">Correct</Badge>
                                                    )}
                                                </Label>
                                            </div>
                                            <div
                                                id={`${id}-${value}-text`}
                                                className="text-muted-foreground text-sm leading-[inherit] max-w-xs truncate"
                                                aria-live="polite"
                                            >
                                                {watchedValues[field] || `Enter ${label.toLowerCase()}` as any}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                            {errors.correctAnswer && (
                                <p className="text-sm text-red-500" role="alert">
                                    {errors.correctAnswer.message}
                                </p>
                            )}
                        </fieldset>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="explanation" className="text-sm font-medium">
                        Explanation
                    </Label>
                    <Textarea
                        id="explanation"
                        placeholder="Provide a detailed explanation for the correct answer (minimum 20 characters)"
                        className={errors.explanation ? "border-red-500 focus:border-red-500" : ""}
                        rows={4}
                        disabled={isSubmitting}
                        {...register("explanation")}
                    />
                    {errors.explanation && (
                        <p className="text-sm text-red-500" role="alert">
                            {errors.explanation.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Adding Question...
                            </>
                        ) : (
                            "Add Question"
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
