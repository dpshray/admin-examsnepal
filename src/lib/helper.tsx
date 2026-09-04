'use client'
import { LucideIcon, PackageOpen } from "lucide-react"
import { memo } from "react"
import { cn } from "./utils"

interface NoDataFoundProps {
    title?: string
    description?: string
    icon?: LucideIcon
    className?: string
}

export const NoDataFound = memo(
    ({
         title = "No data found",
         description = "Get started by creating your first item.",
         icon: Icon = PackageOpen,
         className
     }: NoDataFoundProps) => {
        return (
            <div className={cn("flex flex-col items-center justify-center ", className)}>
                <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true"/>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        )
    }
)

NoDataFound.displayName = "NoDataFound"
