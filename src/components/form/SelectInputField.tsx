"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SelectValueType = string | number;

interface Option {
    value: SelectValueType;
    label: string;
}

interface SelectInputProps {
    label?: string;
    placeholder: string;
    name?: string;
    required?: boolean;
    options: Option[];
    className?: string;
    error?: string;
    value?: SelectValueType;
    onChange: (value: SelectValueType) => void;
    [key: string]: any;
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
                                             onChange,
                                             ...props
                                         }: SelectInputProps) {
    const stringValue = value !== undefined && value !== null ? String(value) : undefined;
    const [selectedValue, setSelectedValue] = useState<string | undefined>(stringValue);

    useEffect(() => {
        setSelectedValue(stringValue);
    }, [stringValue]);

    const handleValueChange = (val: string) => {
        setSelectedValue(val);
        const matched = options.find((opt) => String(opt.value) === val);
        if (matched) {
            onChange(matched.value);
        } else {
            onChange(val);
        }
    };

    const errorId = error && name ? `${name}-error` : undefined;

    return (
        <div className="space-y-2">
            {label && (
                <Label
                    htmlFor={name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}
            <Select value={selectedValue} onValueChange={handleValueChange} {...props}>
                <SelectTrigger
                    id={name}
                    aria-label={label}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                    className={cn(
                        "w-full border border-input focus-visible:ring-0",
                        error && "border-red-500 focus:ring-red-500 ring-offset-red-500",
                        className
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="border border-input">
                    <SelectGroup>
                        {options.map(({ value: optionValue, label: optionLabel }) => (
                            <SelectItem key={String(optionValue)} value={String(optionValue)}>
                                {optionLabel}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {error && (
                <p id={errorId} className="text-sm text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
