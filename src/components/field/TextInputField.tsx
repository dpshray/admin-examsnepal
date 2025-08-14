'use client'

import React from "react"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"

export interface TextInputFieldProps {
    name?: string
    label?: string
    placeholder?: string
    type?: string
    required?: boolean
    className?: string
    icon?: React.ElementType
    error?: string
    textarea?: boolean
    disabled?: boolean

    [key: string]: any
}

const TextInputField: React.FC<TextInputFieldProps> = React.memo(({
                                                                      name,
                                                                      label,
                                                                      placeholder,
                                                                      type = "text",
                                                                      required = false,
                                                                      className,
                                                                      icon: Icon,
                                                                      error,
                                                                      textarea = false,
                                                                      disabled = false,
                                                                      ...props
                                                                  }) => {
    const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
        <div className="space-y-1 w-full">
            {label && (
                <Label
                    htmlFor={inputId}
                    className={cn("text-sm font-medium transition-colors", error && "text-red-500")}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            <div className="relative">
                {Icon && (
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground",
                            error && "text-red-500"
                        )}
                    >
                        <Icon size={16} aria-hidden="true"/>
                    </div>
                )}

                {textarea ? (
                    <Textarea
                        id={inputId}
                        name={name}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-errormessage={error ? `${inputId}-error` : undefined}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        aria-required={required}
                        className={cn(
                            "w-full min-h-[100px] rounded-2xl border px-4 py-3 text-sm shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:bg-background dark:text-white",
                            Icon && "pl-10",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        {...props}
                    />
                ) : (
                    <Input
                        id={inputId}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-errormessage={error ? `${inputId}-error` : undefined}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        aria-required={required}
                        className={cn(
                            '',
                            Icon ? "pl-10" : "pl-3",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        {...props}
                    />
                )}

                {error && (
                    <p id={`${inputId}-error`} className="text-sm text-red-500 mt-1">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
})

TextInputField.displayName = "TextInputField"

export default TextInputField
