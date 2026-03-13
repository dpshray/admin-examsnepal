'use client'

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Edit, Eye, EyeOff, Loader2, LucideIcon, MoreVertical, Trash2 } from "lucide-react"
import { Row } from "@tanstack/react-table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"

interface ExtraAction {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: 'default' | 'destructive'
}

interface CustomAction {
    icon: LucideIcon
    onClick: () => void
    label: string
    className?: string
    bgClassName?: string
    iconClassName?: string
    tooltipClassName?: string
}

interface RowActionsProps<TData> {
    row: Row<TData>
    onEditAction?: (row: Row<TData>) => void
    onDeleteAction?: (row: Row<TData>) => void
    onViewAction?: (row: Row<TData>) => void
    extraActions?: ExtraAction[]
    customActions?: CustomAction[]
    className?: string
    editLabel?: string
    deleteLabel?: string
    viewLabel?: string
}

function ActionIconButton({
    icon: Icon,
    onClick,
    label,
    bgClassName,
    iconClassName,
    tooltipClassName,
}: {
    icon: LucideIcon
    onClick: () => void
    label: string
    bgClassName: string
    iconClassName: string
    tooltipClassName?: string
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    onClick={onClick}
                    aria-label={label}
                    className={cn(
                        "rounded-full flex items-center justify-center",
                        "transition-all duration-200 hover:scale-105 active:scale-95",
                        bgClassName
                    )}
                >
                    <Icon className={cn("h-4 w-4", iconClassName)} aria-hidden="true" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5} className={tooltipClassName}>
                <p className="text-xs font-medium">{label}</p>
            </TooltipContent>
        </Tooltip>
    )
}

const RowActions = <TData,>({
    row,
    onEditAction,
    onDeleteAction,
    onViewAction,
    extraActions = [],
    customActions = [],
    className,
    editLabel = "Edit",
    deleteLabel = "Delete",
    viewLabel = "View",
}: RowActionsProps<TData>) => {
    const handleEdit = useCallback(() => onEditAction?.(row), [onEditAction, row])
    const handleDelete = useCallback(() => onDeleteAction?.(row), [onDeleteAction, row])
    const handleView = useCallback(() => onViewAction?.(row), [onViewAction, row])

    return (
        <TooltipProvider delayDuration={200}>
            <div className={cn("flex items-center justify-start gap-2", className)}>

                {onViewAction && (
                    <ActionIconButton
                        icon={Eye}
                        onClick={handleView}
                        label={viewLabel}
                        bgClassName="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        iconClassName="text-slate-600 dark:text-slate-300"
                    />
                )}

                {/* Custom Icon Actions */}
                {customActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <ActionIconButton
                            key={index}
                            icon={Icon}
                            onClick={action.onClick}
                            label={action.label}
                            bgClassName={action.bgClassName ?? "bg-slate-100 hover:bg-slate-200"}
                            iconClassName={action.iconClassName ?? "text-slate-600"}
                            tooltipClassName={action.tooltipClassName}
                        />
                    )
                })}

                {onEditAction && (
                    <ActionIconButton
                        icon={Edit}
                        onClick={handleEdit}
                        label={editLabel}
                        bgClassName="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
                        iconClassName="text-blue-600 dark:text-blue-400"
                        tooltipClassName="border-primary bg-primary text-white"
                    />
                )}

                {onDeleteAction && (
                    <ActionIconButton
                        icon={Trash2}
                        onClick={handleDelete}
                        label={deleteLabel}
                        bgClassName="bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                        iconClassName="text-red-500 dark:text-red-400"
                        tooltipClassName="border-red-600 bg-red-600 text-white"
                    />
                )}

                {/* Extra Actions Dropdown */}
                {extraActions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="More actions"
                                className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center",
                                    "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                                    "transition-all duration-200 hover:scale-105 active:scale-95"
                                )}
                            >
                                <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {extraActions.map((action, index) => {
                                const Icon = action.icon
                                return (
                                    <DropdownMenuItem
                                        key={index}
                                        onClick={action.onClick}
                                        className={cn(
                                            "cursor-pointer",
                                            action.variant === 'destructive' && "text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                        )}
                                    >
                                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                                        <span>{action.label}</span>
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </TooltipProvider>
    )
}


interface GlobalStatusToggleProps<T> {
    item: T
    idKey: keyof T
    statusKey: keyof T
    onToggleAction: (item: T, newStatus: boolean) => Promise<void>
    activeLabel?: string
    inactiveLabel?: string
    activeIcon?: LucideIcon
    inactiveIcon?: LucideIcon
    className?: string
    showBadge?: boolean
    showIcon?: boolean
    disabled?: boolean
}

const GlobalStatusToggle = <T extends Record<string, any>>({
    item,
    idKey,
    statusKey,
    onToggleAction,
    activeLabel = "Active",
    inactiveLabel = "Inactive",
    activeIcon: ActiveIcon = Eye,
    inactiveIcon: InactiveIcon = EyeOff,
    className,
    showBadge = true,
    showIcon = true,
    disabled = false,
}: GlobalStatusToggleProps<T>) => {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = useCallback(
        async (checked: boolean) => {
            if (isUpdating || disabled) return
            setIsUpdating(true)
            try {
                await onToggleAction(item, checked)
            } catch (error) {
                console.error("Status toggle failed:", error)
            } finally {
                setIsUpdating(false)
            }
        },
        [item, onToggleAction, isUpdating, disabled]
    )

    const id = String(item[idKey])
    const isActive = Boolean(item[statusKey])
    const isDisabled = disabled || isUpdating
    const CurrentIcon = isActive ? ActiveIcon : InactiveIcon
    const label = isActive ? activeLabel : inactiveLabel

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="relative flex items-center">
                <Switch
                    id={`status-${id}`}
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isDisabled}
                    aria-label={`Toggle ${label.toLowerCase()}`}
                    className={cn(
                        "transition-all duration-200",
                        isDisabled && "cursor-not-allowed opacity-50",
                        isActive
                            ? "data-[state=checked]:bg-emerald-500 hover:data-[state=checked]:bg-emerald-600"
                            : "data-[state=unchecked]:bg-slate-300 hover:data-[state=unchecked]:bg-slate-400 dark:data-[state=unchecked]:bg-slate-700"
                    )}
                />
                {isUpdating && (
                    <Loader2 className="absolute -right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-hidden="true" />
                )}
            </div>
            <Label htmlFor={`status-${id}`} className="sr-only">
                Toggle status
            </Label>
            {showBadge && (
                <Badge
                    variant="outline"
                    className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200",
                        isActive
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                    )}
                >
                    {showIcon && <CurrentIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span className="tracking-wide">{label}</span>
                </Badge>
            )}
        </div>
    )
}

GlobalStatusToggle.displayName = "GlobalStatusToggle"
RowActions.displayName = "RowActions"

export { GlobalStatusToggle, RowActions }