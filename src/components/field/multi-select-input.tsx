import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from "react";
import {Check, ChevronDown, Search, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface OptionType {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface MultiSelectFieldProps {
    label?: string;
    placeholder?: string;
    options: OptionType[];
    value?: (string | number)[];
    defaultValue?: (string | number)[];
    onValueChange?: (value: (string | number)[]) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    maxSelected?: number;
    className?: string;
    searchable?: boolean;
    clearable?: boolean;
    emptyMessage?: string;
    searchPlaceholder?: string;
}

export default function MultiSelectField({
                                             label,
                                             placeholder = "Select items...",
                                             options = [],
                                             value,
                                             defaultValue = [],
                                             onValueChange,
                                             error,
                                             required = false,
                                             disabled = false,
                                             maxSelected,
                                             className,
                                             searchable = true,
                                             clearable = true,
                                             emptyMessage = "No items found.",
                                             searchPlaceholder = "Search..."
                                         }: MultiSelectFieldProps) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [internalValue, setInternalValue] = useState<(string | number)[]>(defaultValue);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);


    const selectedValues = value ?? internalValue;

    const handleValueChange = useCallback(
        (newValue: (string | number)[]) => {
            if (value === undefined) {
                setInternalValue(newValue);
            }
            onValueChange?.(newValue);
        },
        [value, onValueChange]
    );

    const toggleSelection = useCallback(
        (optionValue: string | number) => {
            if (disabled) return;

            const isSelected = selectedValues.includes(optionValue);
            let newValue: (string | number)[];

            if (isSelected) {
                newValue = selectedValues.filter((v) => v !== optionValue);
            } else {
                if (maxSelected && selectedValues.length >= maxSelected) return;
                newValue = [...selectedValues, optionValue];
            }

            handleValueChange(newValue);
        },
        [selectedValues, disabled, maxSelected, handleValueChange]
    );

    const removeSelection = useCallback(
        (optionValue: string | number) => {
            if (disabled) return;
            const newValue = selectedValues.filter((v) => v !== optionValue);
            handleValueChange(newValue);
        },
        [selectedValues, disabled, handleValueChange]
    );

    const clearAll = useCallback(() => {
        if (disabled) return;
        handleValueChange([]);
    }, [disabled, handleValueChange]);

    const filteredOptions = useMemo(() => {
        if (!search || !searchable) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search, searchable]);

    const selectedOptions = useMemo(() => {
        return selectedValues
            .map((val) => options.find((option) => option.value === val))
            .filter((option): option is OptionType => option !== undefined);
    }, [selectedValues, options]);

    const hasSelection = selectedValues.length > 0;
    const isMaxSelected = maxSelected ? selectedValues.length >= maxSelected : false;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    useEffect(() => {
        if (open && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [open, searchable]);

    return (
        <div className="w-full space-y-2" ref={dropdownRef}>
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    type="button"
                    onClick={() => !disabled && setOpen(!open)}
                    aria-expanded={open}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : undefined}
                    disabled={disabled}
                    className={cn(
                        "w-full min-h-10 h-auto px-3 py-2 justify-start",
                        error && "border-destructive focus-visible:ring-destructive",
                        !hasSelection && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex flex-wrap items-center gap-1 overflow-hidden flex-1 min-h-6">
                        {hasSelection ? (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.value}
                                    variant="secondary"
                                    className="rounded-sm px-2 py-0.5 text-xs font-normal h-6 flex items-center"
                                >
                                    <span className="truncate max-w-[100px]">{option.label}</span>
                                    {clearable && !disabled && (
                                        <button
                                            type="button"
                                            className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:bg-muted-foreground/20 transition-colors"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeSelection(option.value);
                                            }}
                                            aria-label={`Remove ${option.label}`}
                                        >
                                            <X className="h-3 w-3"/>
                                        </button>
                                    )}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm">{placeholder}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 ml-2 shrink-0">
                        {clearable && hasSelection && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearAll();
                                }}
                                className="h-4 w-4 p-0 hover:bg-muted"
                                aria-label="Clear all selections"
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        )}
                        <ChevronDown
                            className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")}/>
                    </div>
                </Button>

                {open && (
                    <div
                        className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-48 overflow-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = selectedValues.includes(option.value);
                                    const isDisabled = option.disabled || (isMaxSelected && !isSelected) || disabled;

                                    return (
                                        <Button
                                            key={option.value}
                                            variant="ghost"
                                            type="button"
                                            onClick={() => !isDisabled && toggleSelection(option.value)}
                                            disabled={isDisabled}
                                            className={cn(
                                                "w-full justify-between h-auto px-3 py-2 font-normal",
                                                isSelected && "bg-accent"
                                            )}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {isSelected && <Check className="h-4 w-4"/>}
                                        </Button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}

            {maxSelected && (
                <p className="text-xs text-muted-foreground">
                    {selectedValues.length} of {maxSelected} selected
                </p>
            )}
        </div>
    );
}