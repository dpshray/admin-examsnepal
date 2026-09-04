"use client"

import type { Editor } from "@tiptap/react"
import { 
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered,
    Undo2, Redo2,
    Code, ImageIcon, Link2, Unlink,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Highlighter, Quote, Minus, RemoveFormatting,
} from "lucide-react"
import { useState } from "react"
import { ColorPicker } from "./ColorPicker"
import { ToolbarButton } from "./ToolbarButton"

interface EditorToolbarProps {
    editor: Editor
    onAddLink: () => void
    onRemoveLink: () => void
    onAddImage?: () => void        // optional
    onImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void  // optional
}

export function EditorToolbar({ 
    editor, 
    onAddLink, 
    onRemoveLink, 
    onAddImage,
    onImageUpload,
}: EditorToolbarProps) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)

    const showImageButtons = !!(onAddImage || onImageUpload)

    return (
        <div className="sticky top-0 z-10 flex flex-wrap gap-1 bg-gray-50 p-2 border-b">
            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })} icon={<Heading1 size={18} />} title="Heading 1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })} icon={<Heading2 size={18} />} title="Heading 2" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })} icon={<Heading3 size={18} />} title="Heading 3" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Text Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")} icon={<Bold size={18} />} title="Bold" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")} icon={<Italic size={18} />} title="Italic" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")} icon={<UnderlineIcon size={18} />} title="Underline" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")} icon={<Strikethrough size={18} />} title="Strikethrough" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")} icon={<Code size={18} />} title="Code" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Text Color */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false) }}
                    className="p-2 rounded hover:bg-gray-200 transition-colors bg-gray-100 text-gray-700"
                    title="Text Color"
                >
                    <div className="relative">
                        <span className="text-sm font-bold">A</span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded"
                            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                    </div>
                </button>
                <ColorPicker editor={editor} type="text" isOpen={showColorPicker} onClose={() => setShowColorPicker(false)} />
            </div>

            {/* Highlight Color */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false) }}
                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("highlight") ? "bg-gray-300 text-blue-600" : "bg-gray-100 text-gray-700"}`}
                    title="Highlight"
                >
                    <Highlighter size={18} />
                </button>
                <ColorPicker editor={editor} type="highlight" isOpen={showHighlightPicker} onClose={() => setShowHighlightPicker(false)} />
            </div>

            <div className="w-px bg-gray-300 mx-1" />

            {/* Text Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} title="Align Left" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} title="Align Center" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} title="Align Right" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })} icon={<AlignJustify size={18} />} title="Justify" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Lists */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")} icon={<List size={18} />} title="Bullet List" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")} icon={<ListOrdered size={18} />} title="Ordered List" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Blockquote & HR */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")} icon={<Quote size={18} />} title="Blockquote" />
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}
                isActive={false} icon={<Minus size={18} />} title="Horizontal Rule" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Links */}
            <ToolbarButton onClick={onAddLink} isActive={editor.isActive("link")} icon={<Link2 size={18} />} title="Add Link" />
            <ToolbarButton onClick={onRemoveLink} isActive={false} icon={<Unlink size={18} />} title="Remove Link"
                disabled={!editor.isActive("link")} />

            {/* Images — only rendered when handlers are provided */}
            {showImageButtons && (
                <>
                    <div className="w-px bg-gray-300 mx-1" />

                    {onImageUpload && (
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                            <div className="p-2 rounded hover:bg-gray-200 transition-colors bg-gray-100 text-gray-700" title="Upload Image">
                                <ImageIcon size={18} />
                            </div>
                        </label>
                    )}

                    {onAddImage && (
                        <ToolbarButton onClick={onAddImage} isActive={false} icon={<Link2 size={18} />} title="Add Image URL" />
                    )}
                </>
            )}

            <div className="w-px bg-gray-300 mx-1" />

            {/* Clear Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                isActive={false} icon={<RemoveFormatting size={18} />} title="Clear Formatting" />

            <div className="w-px bg-gray-300 mx-1" />

            {/* Undo/Redo */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()}
                isActive={false} icon={<Undo2 size={18} />} title="Undo" disabled={!editor.can().undo()} />
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()}
                isActive={false} icon={<Redo2 size={18} />} title="Redo" disabled={!editor.can().redo()} />
        </div>
    )
}