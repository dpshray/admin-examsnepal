import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const generatePageRange = (currentPage: number, totalPages: number) => {
    const delta = 2
    const range: (number | string)[] = []

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
        range.push(i)
    }

    if (currentPage - delta > 2) {
        range.unshift("ellipsis")
    }
    if (currentPage + delta < totalPages - 1) {
        range.push("ellipsis")
    }

    range.unshift(1)
    if (totalPages > 1) {
        range.push(totalPages)
    }

    return range.filter((item, index, arr) => arr.indexOf(item) === index)
}


export const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}