'use client'

import Image from "next/image"
import {useState} from "react"
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card"
import {cn,} from "@/lib/utils"

interface TableHoverImageProps {
    src?: string | null
    alt?: string
    size?: number
    hoverSize?: {
        width: number
        height: number
    }
    className?: string
    thumbnailClassName?: string
    hoverClassName?: string
    showViewText?: boolean
    viewText?: string
    fallbackSrc?: string
    priority?: boolean
    quality?: number
}

export default function GlobalTableHoverImage({
    src,
    alt = "Image",
    size = 32,
    hoverSize = {width: 320, height: 320},
    className,
    thumbnailClassName,
    hoverClassName,
    showViewText = true,
    viewText = alt,
    fallbackSrc = "/placeholder.svg",
    priority = false,
    quality = 75,
}: TableHoverImageProps) {
    const [imageError, setImageError] = useState(false)
    const [hoverImageError, setHoverImageError] = useState(false)

    const imageSrc = imageError ? fallbackSrc : (src || fallbackSrc)
    const hoverImageSrc = hoverImageError ? fallbackSrc : (src || fallbackSrc)

    const handleImageError = () => {
        setImageError(true)
    }

    const handleHoverImageError = () => {
        setHoverImageError(true)
    }

    return (
        <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div
                    className={cn(
                        "flex items-center gap-2 cursor-pointer group transition-opacity hover:opacity-80",
                        className
                    )}
                >
                    <div
                        className={cn(
                            "relative rounded-md overflow-hidden border border-gray-200 bg-gray-50",
                            thumbnailClassName
                        )}
                        style={{width: size, height: size}}
                    >
                        <Image
                            src={imageSrc}
                            alt={`${alt} thumbnail`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={handleImageError}
                            sizes={`${size}px`}
                            priority={priority}
                            quality={quality}
                        />
                    </div>

                    {showViewText && (
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                            {viewText}
                        </span>
                    )}
                </div>
            </HoverCardTrigger>

            <HoverCardContent
                className={cn("p-3 shadow-lg", hoverClassName)}
                style={{width: hoverSize.width}}
                side="right"
                align="center"
            >
                <div className="space-y-2">
                    <div
                        className="relative bg-gray-50 rounded-md overflow-hidden"
                        style={{
                            width: hoverSize.width - 24,
                            height: hoverSize.height
                        }}
                    >
                        <Image
                            src={hoverImageSrc}
                            alt={`${alt} hover`}
                            fill
                            className="object-fill"
                            onError={handleHoverImageError}
                            sizes={`${hoverSize.width}px`}
                            quality={90}
                        />
                    </div>

                    {alt && alt !== "Image" && (
                        <p className="text-xs text-gray-600 text-center truncate">
                            {alt}
                        </p>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}