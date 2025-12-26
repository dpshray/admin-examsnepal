"use client"

import React, {useCallback, useEffect, useMemo, useState, useRef} from "react"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {Check, ChevronDown} from "lucide-react"

interface OptionType {
    value: string | number
    label: string
}

interface SearchSelectFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string
    required?: boolean
    placeholder?: string
    options: OptionType[]
    value?: string | number | null
    error?: string
    name?: string
    disabled?: boolean
    onChange?: (value: string | number) => void
    helperText?: string
    inputClassName?: string
    emptyMessage?: string
    searchPlaceholder?: string
    maxHeight?: number
}

export default function SearchSelectField({
                                              label,
                                              required,
                                              placeholder = "Select option",
                                              options = [],
                                              value,
                                              error,
                                              disabled = false,
                                              onChange,
                                              className,
                                              inputClassName,
                                              helperText,
                                              emptyMessage = "No options found.",
                                              searchPlaceholder,
                                              maxHeight = 300,
                                              ...props
                                          }: SearchSelectFieldProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const listRef = useRef<HTMLDivElement>(null)
    const selectedItemRef = useRef<HTMLDivElement>(null)
    const labelIdRef = useRef(`select-${Math.random().toString(36).slice(2, 11)}`)
    const errorIdRef = useRef(`error-${Math.random().toString(36).slice(2, 11)}`)

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options
        const search = searchTerm.toLowerCase()
        return options.filter(option =>
            option.label.toLowerCase().includes(search)
        )
    }, [options, searchTerm])

    const selectedOption = useMemo(() =>
            value !== undefined && value !== null
                ? options.find(opt => opt.value === value)
                : null,
        [value, options]
    )

    const displayText = selectedOption?.label || ""

    const handleSelect = useCallback((selectedValue: string | number) => {
        onChange?.(selectedValue)
        setOpen(false)
        setSearchTerm("")
    }, [onChange])

    useEffect(() => {
        if (!open) {
            setSearchTerm("")
        } else if (open && selectedItemRef.current && listRef.current) {
            setTimeout(() => {
                selectedItemRef.current?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                })
            }, 100)
        }
    }, [open])

    const labelId = label ? labelIdRef.current : undefined
    const errorId = error ? errorIdRef.current : undefined

    return (
        <div className={cn("w-full space-y-1 md:space-y-2", className)} {...props}>
            {label && (
                <Label
                    id={labelId}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                    {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-labelledby={labelId}
                        aria-describedby={error ? errorId : undefined}
                        aria-invalid={!!error}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between text-left font-normal",
                            error && "border-red-500 focus-visible:ring-red-500",
                            !displayText && "text-muted-foreground",
                            inputClassName
                        )}
                    >
                        <span className={cn("truncate", !displayText && "text-muted-foreground")}>
                            {displayText || placeholder}
                        </span>
                        <ChevronDown
                            size={16}
                            className={cn(
                                "shrink-0 text-muted-foreground/80 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
                    align="start"
                    sideOffset={4}
                >
                    <Command shouldFilter={false} aria-label={`Search ${label || 'options'}`}>
                        <CommandInput
                            placeholder={searchPlaceholder || `Search ${label?.toLowerCase() || 'options'}...`}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList
                            ref={listRef}
                            style={{
                                maxHeight: `${maxHeight}px`,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option,index) => (
                                        <CommandItem
                                            key={index + option.value.toString()}
                                            value={option.value.toString()}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                            ref={value === option.value ? selectedItemRef : null}
                                        >
                                            <span className="flex-1">{option.label}</span>
                                            {value === option.value && (
                                                <Check
                                                    size={16}
                                                    className="ml-2 shrink-0 text-primary"
                                                    aria-label="selected"
                                                />
                                            )}
                                        </CommandItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                        No options available
                                    </div>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {helperText && !error && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {helperText}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1 flex items-center gap-1 text-sm text-red-500" role="alert">
                    <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-red-500" aria-hidden="true"></span>
                    {error}
                </p>
            )}
        </div>
    )
}