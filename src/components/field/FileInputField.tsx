"use client"

import React, { useEffect, useId, useRef, useState, useCallback, memo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { File, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
    label?: string
    error?: string
    onFileChange?: (files: File[]) => void
    showPreviews?: boolean
    showFileList?: boolean
    maxFileSize?: number
    allowedTypes?: string[]
    helperText?: string
    existingImageUrl?: string
    existingImageAlt?: string
}

const FileInputField = memo(({
                                 label,
                                 required = false,
                                 multiple = false,
                                 accept,
                                 className,
                                 error,
                                 disabled,
                                 onFileChange,
                                 showPreviews = true,
                                 showFileList = true,
                                 maxFileSize,
                                 allowedTypes,
                                 helperText,
                                 existingImageUrl,
                                 existingImageAlt = "Current image",
                                 id: propId,
                                 ...props
                             }: FileInputFieldProps) => {
    const generatedId = useId()
    const id = propId || generatedId
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [showExistingImage, setShowExistingImage] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setShowExistingImage(!!existingImageUrl && selectedFiles.length === 0)
    }, [existingImageUrl, selectedFiles.length])

    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previews])

    const validateFile = useCallback((file: File): string | null => {
        if (maxFileSize && file.size > maxFileSize) {
            return `File size exceeds ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`
        }
        if (allowedTypes && !allowedTypes.includes(file.type)) {
            return `File type ${file.type} is not allowed`
        }
        return null
    }, [maxFileSize, allowedTypes])

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files)
        const validFiles: File[] = []

        for (const file of fileArray) {
            const validationError = validateFile(file)
            if (!validationError) {
                validFiles.push(file)
            }
        }

        if (!multiple && validFiles.length > 0) {
            validFiles.splice(1)
        }

        if (validFiles.length > 0) {
            setShowExistingImage(false)
        }

        setSelectedFiles(prev => {
            const newFiles = multiple ? [...prev, ...validFiles] : validFiles
            onFileChange?.(newFiles)
            return newFiles
        })

        const newPreviews = validFiles
            .filter(file => file.type.startsWith("image/"))
            .map(file => URL.createObjectURL(file))

        setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews)
    }, [multiple, validateFile, onFileChange])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files)
        }
    }, [processFiles])

    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index)
            onFileChange?.(newFiles)
            return newFiles
        })

        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index)
            if (prev[index]) {
                URL.revokeObjectURL(prev[index])
            }
            return newPreviews
        })

        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }, [onFileChange])

    const removeExistingImage = useCallback(() => {
        setShowExistingImage(false)
        onFileChange?.([])
    }, [onFileChange])

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [disabled])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (disabled) return

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files)
        }
    }, [disabled, processFiles])

    const isImage = useCallback((file: File) => file.type.startsWith("image/"), [])

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }, [])

    return (
        <div className="w-full space-y-2 sm:space-y-3">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </Label>
            )}

            {showExistingImage && existingImageUrl && (
                <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Current Image:</p>
                    <div className="relative inline-block group">
                        <img
                            src={existingImageUrl}
                            alt={existingImageAlt}
                            className="h-32 w-auto max-w-full rounded-lg border-2 border-border object-contain bg-muted/30"
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                onClick={removeExistingImage}
                                aria-label="Remove current image"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "relative rounded-lg border-2 border-dashed transition-all duration-200",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    error && "border-destructive",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && "hover:border-muted-foreground/40",
                    className
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label="File upload area"
            >
                <Input
                    ref={inputRef}
                    id={id}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    required={required && !showExistingImage}
                    disabled={disabled}
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                    {...props}
                />

                <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 text-center pointer-events-none">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-medium text-primary">
                            Click to upload
                        </span>
                        <span className="hidden sm:inline"> or drag and drop</span>
                    </p>
                    <p className="text-xs text-muted-foreground px-2">
                        {accept ? `Formats: ${accept.split(',').map(a => a.trim()).join(', ')}` : "All file types"}
                        {maxFileSize && ` (Max ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB)`}
                    </p>
                </div>
            </div>

            {showPreviews && previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {previews.map((src, index) => (
                        <div key={`preview-${index}-${src}`} className="relative group">
                            <img
                                src={src}
                                alt={selectedFiles[index]?.name || `Preview ${index + 1}`}
                                className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-border"
                                loading="lazy"
                            />
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    onClick={() => removeFile(index)}
                                    aria-label={`Remove ${selectedFiles[index]?.name}`}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {helperText && !error && (
                <p id={`${id}-helper`} className="text-xs text-muted-foreground">
                    {helperText}
                </p>
            )}

            {showFileList && selectedFiles.length > 0 && (
                <div className="space-y-2" role="list" aria-label="Selected files">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                            role="listitem"
                        >
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                {isImage(file) ? (
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded overflow-hidden flex-shrink-0 border border-border">
                                        <img
                                            src={previews[index]}
                                            alt={file.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <File className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium truncate" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 hover:bg-muted-foreground/10"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <p id={`${id}-error`} className="text-xs sm:text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
})

FileInputField.displayName = "FileInputField"

export default FileInputField