"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { AnimeItem } from "@/lib/api/parser"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { getProxiedImageUrl } from "@/lib/utils"

interface RankingSectionProps {
    data: AnimeItem[]
}

export function RankingSection({ data }: RankingSectionProps) {
  if (!data || data.length === 0) return null

  return (
    <GlassPanel className="p-4 h-fit sticky top-24 bg-black/40 backdrop-blur-xl border-white/10">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Bảng Xếp Hạng
      </h3>

      <div className="space-y-3">
        {data.slice(0, 10).map((anime, index) => (
            <Link 
                key={index} 
                href={anime.path || "#"} 
                className="flex gap-3 group items-center p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
                {/* Rank Number */}
                <div className={`
                    w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-lg
                    ${index === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" :
                      index === 1 ? "bg-gray-400/20 text-gray-400 border border-gray-400/50" :
                      index === 2 ? "bg-orange-700/20 text-orange-700 border border-orange-700/50" :
                      "text-gray-500 bg-white/5"}
                `}>
                    {index + 1}
                </div>

                {/* Image */}
                <div className="w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden relative">
                    <img 
                        src={getProxiedImageUrl(anime.image) || "/placeholder.svg"} 
                        alt={anime.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white/90 text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors mb-1">
                        {anime.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
                            {/* Use anime.chap (Episode) instead of missing rate/views */}
                             {(anime.chap && anime.chap !== "0" && anime.chap !== "?") ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {anime.chap.startsWith("Tập") ? anime.chap : `Tập ${anime.chap}`}
                                </>
                             ) : (
                                <span className="opacity-50">Đang cập nhật</span>
                             )}
                        </span>
                    </div>
                </div>
            </Link>
        ))}
      </div>
    </GlassPanel>
  )
}
