'use client'
import React, {useState} from "react"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"
import {Input} from "../ui/input"

interface FileInputFieldProps {
    name?: string
    label?: string
    placeholder?: string
    required?: boolean
    className?: string
    error?: string
    accept?: string

    [key: string]: any
}

export default function FileInputField({
                                           name,
                                           label,
                                           placeholder,
                                           required = false,
                                           className,
                                           error,
                                           accept,
                                           ...props
                                       }: FileInputFieldProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setSelectedFile(file)
    }

    const errorId = `${name}-error`
    const hasError = !!error

    return (
        <div className="space-y-2">
            {label && (
                <Label
                    htmlFor={name}
                    className={cn("text-sm font-medium", hasError && "text-red-500")}
                >
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            <Input
                id={name}
                name={name}
                type="file"
                accept={accept}
                className={cn(
                    'px-0 py-0 file:border-r file:mr-2 file:h-full file:pr-1.5 file:pl-1.5 file:rounded-none file:bg-gray-200 file:text-sm file:font-medium file:text-gray-700 file:border-gray-300 hover:file:bg-gray-100 focus-visible:file:outline-none focus-visible:file:ring-0 focus-visible:file:ring-offset-0',
                    hasError && "border-red-500 focus-visible:ring-red-500",
                    className
                )}
                placeholder={placeholder}
                required={required}
                onChange={handleFileChange}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                aria-required={required ? "true" : "false"}
                aria-errormessage={hasError ? errorId : undefined}
                {...props}
            />

            {selectedFile && (
                <p className="text-sm text-gray-500 mt-1">{selectedFile.name}</p>
            )}

            {hasError && (
                <p id={errorId} className="text-sm text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    )
}
