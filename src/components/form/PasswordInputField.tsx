'use client'
import React, {useState} from "react"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"
import {Eye, EyeOff} from "lucide-react"
import {Button} from "@/components/ui/button"

interface PassWordInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string
    label?: string
    placeholder?: string
    required?: boolean
    className?: string
    icon?: React.ElementType
    error?: string
    type?: 'password' | 'text',
}

export default function PasswordInputField({
                                               name,
                                               label,
                                               placeholder,
                                               required = false,
                                               className,
                                               icon: Icon,
                                               error,

                                               ...props
                                           }: PassWordInputFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState)
    }

    return (
        <div className="space-y-2">
            {label && (
                <Label
                    htmlFor={name}
                    className={cn("text-sm font-medium", error && "text-red-500")}
                >
                    {label}
                    {required && <span className="text-red-500">*</span>}
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

                <Input
                    id={name}
                    name={name}
                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                    placeholder={placeholder}
                    required={required}
                    tabIndex={0}
                    autoComplete="current-password"
                    autoCorrect="off"
                    className={cn(
                        '',
                        Icon ? "pl-10" : "pl-3",
                        error && "border-red-500 focus-visible:ring-red-500 !focus-visible:ring-[1px] ",
                        className
                    )}
                    {...props}
                />

                <Button
                    type="button"
                    variant={'ghost'}
                    onClick={togglePasswordVisibility}
                    aria-label="Toggle password visibility"
                    tabIndex={0}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:bg-transparent"
                >
                    {showPassword ? (
                        <EyeOff size={16} aria-hidden="true" className={cn('text-muted-foreground')}/>
                    ) : (
                        <Eye size={16} aria-hidden="true" className={cn('text-muted-foreground','data-[ ]:')}/>
                    )}
                </Button>

                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    )
}
