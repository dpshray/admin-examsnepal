"use client"

import type React from "react"
import {memo} from "react"
import {Building2, Plus} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"

interface PageHeaderProps {
    icon?: React.ElementType
    title: string
    description?: string
    className?: string
    actionLabel?: string
    onAction?: () => void
    buttonClassName?: string
}

const PageHeader = memo(function PageHeader({
    icon: Icon = Building2,
    title,
    description,
    className,
    actionLabel = "Add New",
    onAction,
    buttonClassName,
}: PageHeaderProps) {
    return (
        <header
            className={cn("sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80", className)}>
            <div className="mx-auto w-full max-w-7xl py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 transition-transform hover:scale-105 sm:h-12 sm:w-12 sm:rounded-xl"
                            style={{backgroundColor: '#f8f7fc', borderColor: '#e9e6f4'}}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 sm:mt-1 sm:text-sm lg:text-base">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {onAction && (
                        <Button
                            onClick={onAction}
                            size="sm"
                            className={cn(
                                "w-full shrink-0 gap-1.5 shadow-sm transition-all hover:shadow sm:w-auto sm:gap-2",
                                "bg-primaryColor border-primaryColor",
                                buttonClassName
                            )}

                        >
                            <Plus className="h-4 w-4 shrink-0"/>
                            <span className="truncate">{actionLabel}</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
})

export default PageHeader