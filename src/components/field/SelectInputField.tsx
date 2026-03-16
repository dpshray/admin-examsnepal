"use client"

import { useMemo, useCallback } from "react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SelectValueType = string | number

interface Option {
    value: SelectValueType
    label: string
}

interface SelectInputFieldProps {
    label?: string
    placeholder?: string
    name?: string
    required?: boolean
    options: Option[]
    className?: string
    error?: string
    value?: SelectValueType
    onChangeAction: (value: SelectValueType) => void
    disabled?: boolean
    showAll?: boolean
    [key: string]: any
}

export default function SelectInputField({
                                             label,
                                             placeholder,
                                             name,
                                             required = false,
                                             options,
                                             className,
                                             error,
                                             value,
                                             onChangeAction,
                                             disabled = false,
                                             showAll = true, 
                                             ...props
                                         }: SelectInputFieldProps) {
    const stringValue = value !== undefined && value !== null && value !== ""
        ? String(value)
        : showAll ? "__all__" : undefined

    const sanitizedOptions = useMemo(
        () => [
            ...(showAll ? [{ value: "__all__", label: "All" }] : []),
            ...Array.from(
                new Map(
                    options
                        .filter((opt) => opt.value !== undefined && opt.value !== null && opt.value !== "")
                        .map((opt) => [String(opt.value), opt])
                ).values()
            ),
        ],
        [options]
    )

    const handleValueChange = useCallback(
        (val: string) => {
            if (val === "__all__") {
                onChangeAction("")
                return
            }
            const matched = sanitizedOptions.find((opt) => String(opt.value) === val)
            const originalValue = matched?.value
            if (originalValue !== undefined) {
                onChangeAction(originalValue)
            }
        },
        [sanitizedOptions, onChangeAction]
    )

    const errorId = error && name ? `${name}-error` : undefined

    return (
        <div className="space-y-2">
            {label && (
                <Label
                    htmlFor={name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
                </Label>
            )}
            <Select
                value={stringValue}
                onValueChange={handleValueChange}
                disabled={disabled}
                {...props}
            >
                <SelectTrigger
                    id={name}
                    aria-label={label || placeholder}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                    disabled={disabled}
                    className={cn(
                        "w-full",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-w-(--radix-select-trigger-width)">
                    <SelectGroup>
                        {sanitizedOptions.map(({ value: optionValue, label: optionLabel }) => (
                            <SelectItem key={String(optionValue)} value={String(optionValue)} className="whitespace-normal wrap-break-word">
                                {optionLabel}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {error && (
                <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}