"use client"

import { useState } from "react"

import type { ReactNode } from "react"
import { memo, useEffect, useMemo, useCallback } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    LinkIcon,
    Heading3,
    SubscriptIcon,
    SuperscriptIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Typography from "@tiptap/extension-typography"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RichTextEditorProps {
    content?: string
    onChange?: (content: string) => void
    editable?: boolean
    className?: string
    placeholder?: string
    minHeight?: string
}

const ToolbarButton = memo(
    ({
         onClick,
         active,
         disabled,
         children,
         label,
         shortcut,
     }: {
        onClick: () => void
        active?: boolean
        disabled?: boolean
        children: ReactNode
        label: string
        shortcut?: string
    }) => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={label}
                    aria-pressed={active}
                    className={cn(
                        "h-8 w-8 p-0 shrink-0 transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring",
                        active && "bg-accent text-accent-foreground shadow-sm",
                    )}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex flex-col items-center gap-1 px-2 py-1.5">
                <span className="text-xs font-medium">{label}</span>
                {shortcut && (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border font-sans uppercase">{shortcut}</kbd>
                )}
            </TooltipContent>
        </Tooltip>
    ),
)

ToolbarButton.displayName = "ToolbarButton"

const ToolbarDivider = memo(() => (
    <div className="w-px h-5 bg-border/60 mx-1 self-center shrink-0" aria-hidden="true" />
))

ToolbarDivider.displayName = "ToolbarDivider"

export const RichTextEditor = memo(function RichTextEditor({
                                                               content = "",
                                                               onChange,
                                                               editable = true,
                                                               className,
                                                               placeholder = "Start writing something beautiful...",
                                                               minHeight = "250px",
                                                           }: RichTextEditorProps) {
    const [isFocused, setIsFocused] = useState(false)

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: { HTMLAttributes: { class: "list-disc ml-4 space-y-1.5" } },
                orderedList: { HTMLAttributes: { class: "list-decimal ml-4 space-y-1.5" } },
                blockquote: { HTMLAttributes: { class: "border-l-4 border-primary/30 pl-4 italic text-muted-foreground" } },
            }),
            Underline,
            Superscript,
            Subscript,
            Typography,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors",
                },
            }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === "heading") return `Heading ${node.attrs.level}`
                    return placeholder
                },
            }),
        ],
        [placeholder],
    )

    const editor = useEditor({
        extensions,
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none p-6 min-h-inherit",
                    "prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90",
                    "prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:rounded-lg prose-pre:p-4",
                    "selection:bg-primary/10",
                ),
            },
        },
        immediatelyRender: false,
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            const { from, to } = editor.state.selection
            editor.commands.setContent(content, { emitUpdate: false })
            editor.commands.setTextSelection({ from, to })
        }
    }, [content, editor])

    const setLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("URL", previousUrl)

        if (url === null) return
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }, [editor])

    if (!editor) return null

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "relative flex flex-col w-full border border-input rounded-xl bg-background/50 backdrop-blur-sm overflow-hidden",
                    "shadow-sm ring-offset-background transition-all duration-300",
                    isFocused && "ring-2 ring-gray-500/20 border-gray-500 bg-gray-50/50 dark:bg-gray-950/50",
                    !editable && "opacity-60 cursor-not-allowed bg-muted/20 shadow-none",
                    className,
                )}
            >
                {editable && (
                    <div
                        className={cn(
                            "flex flex-wrap items-center gap-0.5 p-2 border-b border-input/60 bg-muted/40 sticky top-0 z-20 transition-colors duration-300",
                            isFocused && "bg-gray-500/5",
                        )}
                    >
                        <div className="flex items-center gap-0.5 mr-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                active={editor.isActive("bold")}
                                label="Bold"
                                shortcut="Mod+B"
                            >
                                <Bold className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                active={editor.isActive("italic")}
                                label="Italic"
                                shortcut="Mod+I"
                            >
                                <Italic className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                active={editor.isActive("underline")}
                                label="Underline"
                                shortcut="Mod+U"
                            >
                                <Type className="h-4 w-4 underline decoration-2 underline-offset-2" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                active={editor.isActive("strike")}
                                label="Strikethrough"
                            >
                                <Strikethrough className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <ToolbarDivider />

                        <div className="flex items-center gap-0.5 mx-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                active={editor.isActive("heading", { level: 1 })}
                                label="Heading 1"
                            >
                                <Heading1 className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                active={editor.isActive("heading", { level: 2 })}
                                label="Heading 2"
                            >
                                <Heading2 className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                active={editor.isActive("heading", { level: 3 })}
                                label="Heading 3"
                            >
                                <Heading3 className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <ToolbarDivider />

                        <div className="flex items-center gap-0.5 mx-1">
                            <ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Add Link">
                                <LinkIcon className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                active={editor.isActive("highlight")}
                                label="Highlight"
                            >
                                <Highlighter className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleCode().run()}
                                active={editor.isActive("code")}
                                label="Inline Code"
                                shortcut="Mod+E"
                            >
                                <Code className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <ToolbarDivider />

                        <div className="flex items-center gap-0.5 mx-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                                active={editor.isActive({ textAlign: "left" })}
                                label="Align Left"
                            >
                                <AlignLeft className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                                active={editor.isActive({ textAlign: "center" })}
                                label="Align Center"
                            >
                                <AlignCenter className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                                active={editor.isActive({ textAlign: "right" })}
                                label="Align Right"
                            >
                                <AlignRight className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <ToolbarDivider />

                        <div className="flex items-center gap-0.5 mx-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                active={editor.isActive("bulletList")}
                                label="Bullet List"
                                shortcut="Mod+Shift+8"
                            >
                                <List className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                active={editor.isActive("orderedList")}
                                label="Numbered List"
                                shortcut="Mod+Shift+7"
                            >
                                <ListOrdered className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                active={editor.isActive("blockquote")}
                                label="Blockquote"
                            >
                                <Quote className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <ToolbarDivider />

                        <div className="flex items-center gap-0.5 mx-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                                active={editor.isActive("superscript")}
                                label="Superscript"
                            >
                                <SuperscriptIcon className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleSubscript().run()}
                                active={editor.isActive("subscript")}
                                label="Subscript"
                            >
                                <SubscriptIcon className="h-4 w-4" />
                            </ToolbarButton>
                        </div>

                        <div className="ml-auto flex items-center gap-0.5 pl-2 border-l border-border/40">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                label="Undo"
                                shortcut="Mod+Z"
                            >
                                <Undo className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                label="Redo"
                                shortcut="Mod+Y"
                            >
                                <Redo className="h-4 w-4" />
                            </ToolbarButton>
                        </div>
                    </div>
                )}

                <div
                    className="flex-1 overflow-auto cursor-text bg-background/30 p-2 sm:p-4"
                    style={{ minHeight }}
                    onClick={() => editor.chain().focus().run()}
                >
                    <EditorContent editor={editor} className="h-full" />
                </div>


            </div>
        </TooltipProvider>
    )
})
