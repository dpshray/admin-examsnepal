"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { User, CalendarDays, AlertCircle } from "lucide-react"
import { FaArrowRightLong } from "react-icons/fa6"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetAdminBlogBySlug } from "@/hooks/useBlogs"

interface Category {
    id: number
    title: string
    slug: string
}

interface Tag {
    id: number
    title: string
    slug: string
}

interface BlogDetail {
    id: number
    title: string
    slug: string
    content: string
    summary: string
    status: "published" | "scheduled" | "draft"
    cta_text: string
    cta_link: string
    author: string
    published_date: string
    image: string
    categories: Category[]
    tag: Tag[]
}

// ─── BlogHeader ───────────────────────────────────────────────────────────────

function BlogHeader({ image, title }: { image: string; title: string }) {
    return (
        <div className="relative w-full h-96 overflow-hidden bg-muted">
            <Image
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="object-contain"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-primary/20 to-transparent" />
        </div>
    )
}

// ─── BlogMeta ─────────────────────────────────────────────────────────────────

function BlogMeta({
    title,
    author,
    publishedDate,
    categories,
}: {
    title: string
    author: string
    publishedDate: string
    categories: Category[]
}) {
    const formattedDate = format(new Date(publishedDate), "MMMM d, yyyy")

    return (
        <div className="pb-10 mb-10 border-b border-border/40">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {title}
            </h1>

            {/* Accent Divider */}
            <div className="h-1 w-40 bg-gradient-to-r from-green-500 to-green-100 rounded-full mt-3 mb-6" />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Author + Date */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                        <User className="w-4 h-4 text-green-600" />
                        {author}
                    </span>
                    <span className="text-primary/40">•</span>
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-green-600" />
                        {formattedDate}
                    </span>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Badge
                                key={category.id}
                                variant="destructive"
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
                            >
                                {category.title}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── BlogContent ──────────────────────────────────────────────────────────────

function BlogContent({ content, summary }: { content: string; summary: string }) {
    return (
        <div className="space-y-10 mb-16">
            {/* Summary */}
            {summary && (
                <div className="text-lg leading-relaxed italic border-l-4 border-green-500 pl-6 py-4 bg-primary/5 text-primary/90 rounded-md shadow-sm">
                    {summary}
                </div>
            )}

            {/* Rich Text */}
            <div
                className="prose prose-lg max-w-none dark:prose-invert
                    prose-headings:text-foreground prose-headings:font-bold
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-em:text-foreground prose-em:italic
                    prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                    prose-pre:bg-muted prose-pre:text-foreground
                    prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    )
}

// ─── BlogTags ─────────────────────────────────────────────────────────────────

function BlogTags({ tags }: { tags: Tag[] }) {
    if (tags.length === 0) return null

    return (
        <div className="border-t border-border pt-10 mt-12">
            <h3 className="text-sm font-semibold text-primary mb-3 tracking-wide">
                Tags
            </h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag.id}
                        variant="outline"
                        className="transition hover:bg-primary hover:text-white border-primary/40 text-primary"
                    >
                        #{tag.title}
                    </Badge>
                ))}
            </div>
        </div>
    )
}

// ─── BlogCTA ──────────────────────────────────────────────────────────────────

function BlogCTA({ cta_text, cta_link }: { cta_text: string; cta_link: string }) {
    if (!cta_text || !cta_link) return null

    return (
        <div className="mt-12 mb-8 flex justify-end">
            <Link href={cta_link} target="_blank" rel="noopener noreferrer">
                <Button
                    className="inline-flex items-center gap-2 group transition-all"
                >
                    <span className="group-hover:underline underline-offset-4">{cta_text}</span>
                    <FaArrowRightLong className="text-white transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
    )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function BlogDetailSkeleton() {
    return (
        <main className="min-h-screen bg-background">
            <Skeleton className="h-96 w-full rounded-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <div className="h-1 w-40 bg-muted rounded-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-20 w-full rounded-md" />
                <div className="space-y-3 pt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
                    ))}
                </div>
                <div className="flex gap-2 pt-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>
            </div>
        </main>
    )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function BlogDetailError() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Blog Not Found</h1>
                <p className="text-muted-foreground max-w-sm">
                    The blog post you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
            </div>
        </main>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
    const { slug } = useParams()
    const safeSlug = Array.isArray(slug) ? slug[0] : slug || ""

    const { data: blog, isLoading, isError } = useGetAdminBlogBySlug(safeSlug)

    if (isLoading) return <BlogDetailSkeleton />
    if (isError || !blog) return <BlogDetailError />

    return (
        <main className="min-h-screen bg-background">
            <BlogHeader image={blog.image} title={blog.title} />

            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BlogMeta
                    title={blog.title}
                    author={blog.author}
                    publishedDate={blog.published_date}
                    categories={blog.categories}
                />

                <BlogContent content={blog.content} summary={blog.summary} />

                <BlogTags tags={blog.tag} />

                {blog.cta_text && blog.cta_link && (
                    <BlogCTA cta_text={blog.cta_text} cta_link={blog.cta_link} />
                )}
            </article>
        </main>
    )
}