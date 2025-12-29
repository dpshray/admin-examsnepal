"use client";

import React, {ElementType, memo, useId} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

interface CommonProps {
    label?: string;
    error?: string;
    icon?: ElementType;
    required?: boolean;
    className?: string;
    helperText?: string;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "required">, CommonProps {
    textarea?: false;
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className" | "required">, CommonProps {
    textarea: true;
}

type TextInputFieldProps = InputProps | TextareaProps;

const TextInputField = memo(function TextInputField({
                                                        label,
                                                        error,
                                                        icon: Icon,
                                                        textarea = false,
                                                        className,
                                                        required,
                                                        helperText,
                                                        ...props
                                                    }: TextInputFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const baseClassName = cn(
        Icon && "pl-10",
        error && "border-destructive focus-visible:ring-destructive",
        "w-full",
        className
    );

    const describedBy = [
        error && errorId,
        helperText && helperId
    ].filter(Boolean).join(" ") || undefined;

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </Label>
            )}

            <div className="relative w-full">
                {Icon && (
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground",
                            error && "text-destructive"
                        )}
                        aria-hidden="true"
                    >
                        <Icon className="h-4 w-4 flex-shrink-0"/>
                    </div>
                )}

                {textarea ? (
                    <Textarea
                        id={id}
                        required={required}
                        className={baseClassName}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        aria-required={required}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <Input
                        id={id}
                        required={required}
                        className={cn(baseClassName, "bg-white")}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        aria-required={required}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
            </div>

            {error && (
                <p id={errorId} className="text-sm text-destructive break-words" role="alert">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p id={helperId} className="text-sm text-muted-foreground break-words">
                    {helperText}
                </p>
            )}
        </div>
    );
});

TextInputField.displayName = "TextInputField";

export default TextInputField;