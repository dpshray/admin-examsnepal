"use client"

import type React from "react"
import {useState} from "react"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {QUERY_STALE_TIME} from "@/config/app-constant";

interface ReactQueryProviderProps {
    children: React.ReactNode
}

export default function ReactQueryProvider({children}: ReactQueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: QUERY_STALE_TIME,
                    },
                },
            }),
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
