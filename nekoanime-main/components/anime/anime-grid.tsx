
"use client"

import { AnimeItem } from "@/lib/api/parser/helpers"
import { AnimeCard } from "./anime-card"
import { cn } from "@/lib/utils"

interface AnimeGridProps {
    items: AnimeItem[]
    className?: string
}

export function AnimeGrid({ items, className }: AnimeGridProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center text-gray-400 py-12">
                Không tìm thấy kết quả nào.
            </div>
        )
    }

    return (
        <div className={cn(
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
            className
        )}>
            {items.map((item, i) => (
                <AnimeCard key={i} item={item} />
            ))}
        </div>
    )
}
