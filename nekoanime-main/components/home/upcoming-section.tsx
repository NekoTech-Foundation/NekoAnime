"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { AnimeItem } from "@/lib/api/parser"
import Link from "next/link"
import Image from "next/image"
import { Calendar, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useRef } from "react"

interface UpcomingSectionProps {
    data: AnimeItem[]
}

export function UpcomingSection({ data }: UpcomingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!data || data.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === "left" ? -300 : 300
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white/90">
             <span className="w-1 h-8 bg-purple-500 rounded-full" />
             Sắp Chiếu
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      <GlassPanel className="bg-black/40 backdrop-blur-xl border-white/10 p-0 overflow-hidden relative group">
         <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 p-6 scrollbar-hide snap-x"
         >
            {data.map((anime, i) => (
                <Link 
                    key={i} 
                    href={anime.path || "#"}
                    className="flex-shrink-0 w-[160px] snap-start group/item relative"
                >
                    {/* Image Container */}
                    <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3">
                        <Image 
                            src={anime.image} 
                            alt={anime.name} 
                            fill
                            className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/0 transition-colors" />
                        
                        {/* Overlay Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                             <div className="w-10 h-10 rounded-full bg-purple-500/80 backdrop-blur flex items-center justify-center text-white scale-50 group-hover/item:scale-100 transition-transform">
                                 <Calendar className="w-5 h-5" />
                             </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="font-medium text-white/90 text-sm line-clamp-2 leading-tight group-hover/item:text-purple-400 transition-colors">
                            {anime.name}
                        </h4>
                        <span className="text-xs text-gray-400 mt-1 block">
                            {anime.chap || "Đang cập nhật"}
                        </span>
                    </div>
                </Link>
            ))}
         </div>
      </GlassPanel>
    </section>
  )
}
