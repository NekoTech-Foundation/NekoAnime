"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { ScheduleItem } from "@/lib/api/parser"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { useState } from "react"

interface ScheduleSectionProps {
    data: ScheduleItem[]
}

export function ScheduleSection({ data }: ScheduleSectionProps) {
  const [activeTab, setActiveTab] = useState(0)

  if (!data || data.length === 0) return null

  const activeDay = data[activeTab]

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white/90">
         <span className="w-1 h-8 bg-green-500 rounded-full" />
         Lịch Chiếu Phim
      </h2>

      <GlassPanel className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
         {/* Tabs */}
         <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
            {data.map((item, index) => (
                <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`
                        flex-shrink-0 px-4 py-2 rounded-xl border transition-all text-sm font-medium
                        flex flex-col items-center gap-1 min-w-[100px]
                        ${activeTab === index 
                            ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                        }
                    `}
                >
                    <span className="uppercase text-[10px] tracking-wider opacity-80">{item.day}</span>
                    <span className="text-lg font-bold">{item.date}/{item.month}</span>
                </button>
            ))}
         </div>

         {/* Content */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDay?.items.map((anime, i) => (
                <Link 
                    key={i} 
                    href={anime.path || "#"}
                    className="flex gap-3 group bg-white/5 p-3 rounded-xl border border-white/5 hover:border-green-500/30 hover:bg-white/10 transition-all"
                >
                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                            src={anime.image} 
                            alt={anime.name} 
                            width={64}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-green-400 text-xs font-bold mb-1 flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {anime.chap || "Tập Mới"}
                        </span>
                        <h4 className="text-white font-medium text-sm line-clamp-2 leading-tight group-hover:text-green-300 transition-colors">
                            {anime.name}
                        </h4>
                    </div>
                </Link>
            ))}
         </div>
      </GlassPanel>
    </section>
  )
}
