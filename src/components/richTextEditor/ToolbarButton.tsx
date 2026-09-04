import type React from "react"

interface ToolbarButtonProps {
    onClick: () => void
    isActive: boolean
    icon: React.ReactNode
    title: string
    disabled?: boolean
}

export function ToolbarButton({ onClick, isActive, icon, title, disabled = false }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            title={title}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? "bg-gray-300 text-blue-600" : "bg-gray-100 text-gray-700"
            }`}
        >
            {icon}
        </button>
    )
}