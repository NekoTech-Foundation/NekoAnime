"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { RankingItem, getRanking } from "@/lib/api/ranking"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trophy } from "lucide-react"

const TYPES = [
  { label: "Mặc định", value: "" },
  { label: "Ngày", value: "day" },
  { label: "Tháng", value: "month" },
  { label: "Năm", value: "year" },
  { label: "Đánh giá", value: "voted" },
  { label: "Mùa", value: "season" },
]

export default function RankingPage() {
  const [data, setData] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState("")

  useEffect(() => {
    async function fetchRanking() {
        setLoading(true)
        try {
            const res = await getRanking(activeType)
            setData(res)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchRanking()
  }, [activeType])

  return (
    <div className="container mx-auto py-12 px-4">
        <GlassPanel className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Bảng Xếp Hạng
            </h1>

            {/* Type Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {TYPES.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setActiveType(type.value)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${activeType === type.value 
                                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="p-10 text-center text-gray-500">Đang tải...</div>
            ) : (
                <div className="space-y-4">
                    {data.map((anime, i) => (
                         <Link 
                            key={i}
                            href={anime.path || "#"}
                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                        >
                            {/* Rank */}
                            <div className={`
                                w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                ${i === 0 ? "bg-yellow-500 text-black" : 
                                  i === 1 ? "bg-gray-400 text-black" :
                                  i === 2 ? "bg-orange-500 text-black" : "bg-white/10 text-gray-400"}
                            `}>
                                {i + 1}
                            </div>

                            {/* Image */}
                            <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                    src={anime.image}
                                    alt={anime.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate group-hover:text-yellow-500 transition-colors">
                                    {anime.name}
                                </h3>
                                <p className="text-xs text-gray-400 truncate mb-1">
                                    {anime.othername}
                                </p>
                                <div className="flex gap-3 text-xs text-gray-500">
                                   <span>{anime.process}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </GlassPanel>
    </div>
  )
}
