"use client"

import * as React from "react"
import {useId} from "react"
import {Eye, EyeOff} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

interface PasswordInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ElementType
}

export default function PasswordInputField({
                                               className,
                                               label,
                                               error,
                                               icon: Icon,
                                               required,
                                               ...props
                                           }: PasswordInputFieldProps) {
    const id = useId()
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true"/>
                    </div>
                )}
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    required={required}
                    className={cn(
                        "pr-10",
                        Icon && "pl-10",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground"/>
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground"/>
                    )}
                </Button>
            </div>
            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    )
}