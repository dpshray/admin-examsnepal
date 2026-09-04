import { HIGHLIGHT_COLORS, TEXT_COLORS } from "@/config/app-constant"
import type { Editor } from "@tiptap/react"

interface ColorPickerProps {
    editor: Editor
    type: "text" | "highlight"
    isOpen: boolean
    onClose: () => void
}

export function ColorPicker({ editor, type, isOpen, onClose }: ColorPickerProps) {
    if (!isOpen) return null

    const colors = type === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS
    const isHighlight = type === "highlight"

    const handleColorSelect = (color: string) => {
        if (isHighlight) {
            editor.chain().focus().toggleHighlight({ color }).run()
        } else {
            editor.chain().focus().setColor(color).run()
        }
        onClose()
    }

    const handleReset = () => {
        if (isHighlight) {
            editor.chain().focus().unsetHighlight().run()
        } else {
            editor.chain().focus().unsetColor().run()
        }
        onClose()
    }

    return (
        <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-lg p-2">
            <div className={`grid gap-1 ${isHighlight ? 'grid-cols-5 w-40' : 'grid-cols-8 w-48'}`}>
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                        type="button"
                    />
                ))}
            </div>
            <button
                onClick={handleReset}
                type="button"
                className="w-full mt-2 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
                {isHighlight ? "Remove Highlight" : "Reset Color"}
            </button>
        </div>
    )
}