"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { AnimeItem } from "@/lib/api/parser"
import Link from "next/link"
import { Eye, Star, Trophy } from "lucide-react"

interface RankingSectionProps {
    data: AnimeItem[]
}

export function RankingSection({ data }: RankingSectionProps) {
  if (!data || data.length === 0) return null

  return (
    <GlassPanel className="p-6 h-fit sticky top-24 bg-black/40 backdrop-blur-xl border-white/10">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Bảng Xếp Hạng
      </h3>

      <div className="space-y-4">
        {data.slice(0, 10).map((anime, index) => (
            <Link 
                key={index} 
                href={anime.path || "#"} 
                className="flex gap-4 group items-center p-2 rounded-xl hover:bg-white/5 transition-colors"
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
                <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
                    <img 
                        src={anime.image} 
                        alt={anime.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white/90 text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors mb-1">
                        {anime.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {anime.views ? (anime.views / 1000).toFixed(1) + 'K' : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                             <Star className="w-3 h-3 text-yellow-500" />
                             {anime.rate}
                        </span>
                    </div>
                </div>
            </Link>
        ))}
      </div>
    </GlassPanel>
  )
}
