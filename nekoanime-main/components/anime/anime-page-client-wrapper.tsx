
"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const AnimeDetailView = dynamic(() => import("@/components/anime/anime-detail-view"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[50vh] items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                 <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                 <p className="text-gray-400">Đang tải...</p>
            </div>
        </div>
    )
})

interface WrapperProps {
    slugParts: string[]
}

export default function AnimePageClientWrapper({ slugParts }: WrapperProps) {
    return <AnimeDetailView slugParts={slugParts} />
}
