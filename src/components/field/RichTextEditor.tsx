"use client"

import type React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { useEffect, useState, useCallback } from "react"
import { Label } from "../ui/label"
import { EditorToolbar } from "../richTextEditor/EditorToolbar"

// Custom Image Extension with floating support
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: { default: null },
            height: { default: null },
            float: {
                default: null,
                parseHTML: element => element.style.float || null,
                renderHTML: attributes => {
                    if (!attributes.float) return {}
                    return {
                        style: `float: ${attributes.float}; margin: ${attributes.float === 'left' ? '0 1rem 1rem 0' : '0 0 1rem 1rem'};`,
                    }
                },
            },
            display: {
                default: 'block',
                parseHTML: element => element.style.display || 'block',
                renderHTML: attributes => {
                    if (attributes.float) return {}
                    return {
                        style: `display: ${attributes.display}; margin-left: ${attributes.display === 'block' ? 'auto' : '0'}; margin-right: ${attributes.display === 'block' ? 'auto' : '0'};`,
                    }
                },
            },
        }
    },
})

interface RichTextEditorProps {
    value?: string
    onChange: (html: string) => void
    label?: string
    showImage?: boolean // ← set to false to hide image toolbar buttons
}

export default function RichTextEditor({
    value,
    onChange,
    label,
    showImage = true,
}: RichTextEditorProps) {
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [imageAlt, setImageAlt] = useState("")
    const [imageWidth, setImageWidth] = useState("")
    const [imageAlignment, setImageAlignment] = useState<"left" | "center" | "right" | "float-left" | "float-right">("center")

    const extensions = [
        StarterKit.configure({
            bulletList: { HTMLAttributes: { class: "list-disc list-outside ps-5" } },
            orderedList: { HTMLAttributes: { class: "list-decimal list-outside ps-5" } },
            blockquote: { HTMLAttributes: { class: "border-l-4 border-gray-300 pl-4 italic my-4" } },
            horizontalRule: { HTMLAttributes: { class: "my-4 border-gray-300" } },
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: { class: "text-blue-600 underline cursor-pointer hover:text-blue-800" },
        }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        TextStyle,
        Color,
        // Only include image extension when showImage is true
        ...(showImage ? [CustomImage.configure({ HTMLAttributes: { class: "rounded-lg" } })] : []),
    ]

    const editor = useEditor({
        extensions,
        content: value || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4",
            },
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Sync external value (for update forms populating after fetch)
    useEffect(() => {
        if (editor && value !== undefined && editor.getHTML() !== value) {
            editor.commands.setContent(value)
        }
    }, [editor, value])

    const normalizeUrl = (url: string) => {
        if (!url) return ""
        if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url
        return `https://${url}`
    }

    const handleAddLink = useCallback(() => {
        if (!editor) return
        setLinkUrl(editor.getAttributes("link").href || "")
        setShowLinkModal(true)
    }, [editor])

    const handleSetLink = useCallback(() => {
        if (!editor) return
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({
                href: normalizeUrl(linkUrl),
                target: "_blank",
                rel: "noopener noreferrer",
            }).run()
        }
        setShowLinkModal(false)
        setLinkUrl("")
    }, [editor, linkUrl])

    const handleRemoveLink = useCallback(() => {
        if (!editor) return
        editor.chain().focus().unsetLink().run()
    }, [editor])

    const handleAddImage = useCallback(() => {
        setShowImageModal(true)
        setImageUrl("")
        setImageAlt("")
        setImageWidth("")
        setImageAlignment("center")
    }, [])

    const handleSetImage = useCallback(() => {
        if (!editor || !imageUrl) return
        const attrs: any = { src: imageUrl, alt: imageAlt || "Image" }
        if (imageWidth) attrs.width = imageWidth
        if (imageAlignment === "float-left") {
            attrs.float = "left"
        } else if (imageAlignment === "float-right") {
            attrs.float = "right"
        } else {
            attrs.display = "block"
            if (imageAlignment === "center") attrs.style = "display: block; margin-left: auto; margin-right: auto;"
            else if (imageAlignment === "left") attrs.style = "display: block; margin-right: auto;"
            else if (imageAlignment === "right") attrs.style = "display: block; margin-left: auto;"
        }
        editor.chain().focus().setImage(attrs).run()
        setShowImageModal(false)
        setImageUrl("")
        setImageAlt("")
        setImageWidth("")
        setImageAlignment("center")
    }, [editor, imageUrl, imageAlt, imageWidth, imageAlignment])

    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !editor) return
        if (!file.type.startsWith("image/")) { alert("Please select an image file"); event.target.value = ""; return }
        if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5MB"); event.target.value = ""; return }
        const reader = new FileReader()
        reader.onload = (e) => {
            setImageUrl(e.target?.result as string)
            setImageAlt(file.name)
            setImageWidth("400")
            setImageAlignment("center")
            setShowImageModal(true)
            event.target.value = ""
        }
        reader.readAsDataURL(file)
    }, [editor])

    if (!editor) {
        return <div className="border rounded-md p-2 min-h-[150px] bg-gray-50">Loading editor...</div>
    }

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <Label className="text-sm font-medium">
                    {label} <span className="text-red-500">*</span>
                </Label>
            )}

            <div className="border rounded-md overflow-hidden bg-white">
                <EditorToolbar
                    editor={editor}
                    onAddLink={handleAddLink}
                    onRemoveLink={handleRemoveLink}
                    // Only pass image handlers when showImage is true
                    onAddImage={showImage ? handleAddImage : undefined}
                    onImageUpload={showImage ? handleImageUpload : undefined}
                />
                <div className="min-h-[140px] max-h-[500px] overflow-y-auto">
                    <EditorContent editor={editor} className="focus-within:outline-none" />
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Add Link</h3>
                        <input
                            type="url"
                            placeholder="Enter URL (https://example.com)"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSetLink()
                                else if (e.key === "Escape") { setShowLinkModal(false); setLinkUrl("") }
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setShowLinkModal(false); setLinkUrl("") }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                                Cancel
                            </button>
                            <button onClick={handleSetLink}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Add Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal — only rendered when showImage is true */}
            {showImage && showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px] shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input type="url" placeholder="https://example.com/image.jpg" value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus={!imageUrl} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alt Text</label>
                                <input type="text" placeholder="Describe the image" value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Width (pixels)</label>
                                <input type="number" placeholder="400" value={imageWidth}
                                    onChange={(e) => setImageWidth(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <p className="text-xs text-gray-500 mt-1">Leave empty for full width</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Alignment</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["left", "center", "right", "float-left", "float-right"] as const).map((align) => (
                                        <button key={align} onClick={() => setImageAlignment(align)}
                                            className={`p-3 border rounded text-left ${imageAlignment === align ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${align === "float-right" ? "col-span-2" : ""}`}>
                                            <div className="font-medium text-sm capitalize">{align.replace("-", " ")}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {imageUrl && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preview</label>
                                    <div className="border rounded p-2 bg-gray-50">
                                        <img src={imageUrl} alt="Preview"
                                            style={{ maxWidth: imageWidth ? `${imageWidth}px` : '100%', height: 'auto', display: 'block',
                                                margin: imageAlignment === 'center' ? '0 auto' : imageAlignment === 'right' ? '0 0 0 auto' : '0' }}
                                            onError={() => alert("Failed to load image")} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => { setShowImageModal(false); setImageUrl(""); setImageAlt(""); setImageWidth(""); setImageAlignment("center") }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleSetImage} disabled={!imageUrl}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Insert Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}