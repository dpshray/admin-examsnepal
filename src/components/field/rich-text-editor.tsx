"use client"

import type React from "react"
import {memo, useCallback, useEffect, useMemo} from "react"
import {Editor, EditorContent, useEditor} from "@tiptap/react"
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
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Document from "@tiptap/extension-document"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TextAlign from "@tiptap/extension-text-align"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"

interface TiptapEditorProps {
    content?: string
    onChange?: (html: string) => void
    editable?: boolean
    className?: string
    placeholder?: string
    minHeight?: string
}

interface ToolbarButtonProps {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    ariaLabel: string
}

interface ToolbarAction {
    icon: React.ComponentType<{ className?: string }>
    action: () => void
    active: () => boolean
    label: string
}

interface ToolbarDividerItem {
    divider: true
}

type ToolbarItem = ToolbarAction | ToolbarDividerItem

const ToolbarButton = memo<ToolbarButtonProps>(({
                                                    onClick,
                                                    active,
                                                    disabled,
                                                    children,
                                                    ariaLabel
                                                }: ToolbarButtonProps) => (
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={active}
        className={cn(
            "h-8 w-8 p-0 shrink-0 transition-colors",
            active && "bg-accent text-accent-foreground"
        )}
    >
        {children}
    </Button>
))

ToolbarButton.displayName = "ToolbarButton"

const ToolbarDivider = memo(() => (
    <div className="w-px h-8 bg-border mx-1 shrink-0" aria-hidden="true"/>
))

ToolbarDivider.displayName = "ToolbarDivider"

export const RichTextEditor = memo<TiptapEditorProps>(function TiptapEditor({
                                                                              content = "",
                                                                              onChange,
                                                                              editable = true,
                                                                              className,
                                                                              placeholder = "Write, type '/' for commands",
                                                                              minHeight = "200px"
                                                                          }: TiptapEditorProps) {
    const extensions = useMemo(() => [
        StarterKit.configure({
            orderedList: {
                HTMLAttributes: {
                    class: "list-decimal ml-4",
                },
            },
            bulletList: {
                HTMLAttributes: {
                    class: "list-disc ml-4",
                },
            },
            heading: {
                levels: [1, 2, 3, 4],
            },
        }),
        Placeholder.configure({
            emptyNodeClass: "is-editor-empty",
            placeholder: ({node}) => {
                switch (node.type.name) {
                    case "heading":
                        return `Heading ${node.attrs.level}`
                    case "detailsSummary":
                        return "Section title"
                    case "codeBlock":
                        return ""
                    default:
                        return placeholder
                }
            },
            includeChildren: false,
        }),
        Document,
        Paragraph,
        Text,
        TextAlign.configure({
            types: ["heading", "paragraph"],
        }),
        Subscript,
        Superscript,
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: "text-primary underline cursor-pointer",
            },
        }),
        Highlight.configure({
            multicolor: true,
        }),
        Typography,
    ], [placeholder])

    const handleUpdate = useCallback(({editor}: { editor: Editor }) => {
        onChange?.(editor.getHTML())
    }, [onChange])

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content,
        editable,
        onUpdate: handleUpdate,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl",
                    "max-w-none focus:outline-none p-3 sm:p-4 md:p-6",
                    "prose-headings:scroll-mt-20 prose-headings:font-semibold",
                    "prose-p:leading-relaxed prose-pre:rounded-lg"
                ),
                role: "textbox",
                "aria-multiline": "true",
                "aria-label": editable ? "Text editor" : "Text content",
            },
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            const {from, to} = editor.state.selection
            editor.commands.setContent(content, {emitUpdate: false})
            editor.commands.setTextSelection({from, to})
        }
    }, [content, editor])

    const toolbarActions = useMemo<ToolbarItem[]>(() => {
        if (!editor) return []

        return [
            {
                icon: Bold,
                action: () => editor.chain().focus().toggleBold().run(),
                active: () => editor.isActive("bold"),
                label: "Bold (Ctrl+B)"
            },
            {
                icon: Italic,
                action: () => editor.chain().focus().toggleItalic().run(),
                active: () => editor.isActive("italic"),
                label: "Italic (Ctrl+I)"
            },
            {
                icon: Strikethrough,
                action: () => editor.chain().focus().toggleStrike().run(),
                active: () => editor.isActive("strike"),
                label: "Strikethrough"
            },
            {
                icon: Code,
                action: () => editor.chain().focus().toggleCode().run(),
                active: () => editor.isActive("code"),
                label: "Code"
            },
            {divider: true},
            {
                icon: Heading1,
                action: () => editor.chain().focus().toggleHeading({level: 1}).run(),
                active: () => editor.isActive("heading", {level: 1}),
                label: "Heading 1"
            },
            {
                icon: Heading2,
                action: () => editor.chain().focus().toggleHeading({level: 2}).run(),
                active: () => editor.isActive("heading", {level: 2}),
                label: "Heading 2"
            },
            {divider: true},
            {
                icon: List,
                action: () => editor.chain().focus().toggleBulletList().run(),
                active: () => editor.isActive("bulletList"),
                label: "Bullet list"
            },
            {
                icon: ListOrdered,
                action: () => editor.chain().focus().toggleOrderedList().run(),
                active: () => editor.isActive("orderedList"),
                label: "Numbered list"
            },
            {
                icon: Quote,
                action: () => editor.chain().focus().toggleBlockquote().run(),
                active: () => editor.isActive("blockquote"),
                label: "Blockquote"
            },
            {divider: true},
            {
                icon: Undo,
                action: () => editor.chain().focus().undo().run(),
                active: () => false,
                label: "Undo (Ctrl+Z)"
            },
            {
                icon: Redo,
                action: () => editor.chain().focus().redo().run(),
                active: () => false,
                label: "Redo (Ctrl+Y)"
            },
        ]
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div
            className={cn("border border-border rounded-lg overflow-hidden bg-background", className)}
            style={{minHeight}}
        >
            {editable && (
                <div
                    className="border-b border-border bg-muted/50 p-1.5 sm:p-2 flex flex-wrap gap-0.5 sm:gap-1"
                    role="toolbar"
                    aria-label="Text formatting toolbar"
                >
                    {toolbarActions.map((item, index) =>
                        'divider' in item ? (
                            <ToolbarDivider key={`divider-${index}`}/>
                        ) : (
                            <ToolbarButton
                                key={index}
                                onClick={item.action}
                                active={item.active()}
                                ariaLabel={item.label}
                            >
                                <item.icon className="h-4 w-4"/>
                            </ToolbarButton>
                        )
                    )}
                </div>
            )}

            <EditorContent
                editor={editor}
                className="bg-background overflow-auto"
                style={{minHeight}}
            />
        </div>
    )
})