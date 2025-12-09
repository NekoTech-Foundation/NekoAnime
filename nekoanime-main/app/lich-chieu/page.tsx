"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { ScheduleItem, getSchedule } from "@/lib/api/schedule"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"

function formatDay(day: string) {
    // Map text days to numbers or standard format
    // "Thứ Hai" -> "Thứ 2"
    // "Thứ Ba" -> "Thứ 3"
    // ...
    // "Chủ Nhật" -> "Chủ Nhật"
    const map: Record<string, string> = {
        "Hai": "2",
        "Ba": "3",
        "Tư": "4", 
        "Năm": "5",
        "Sáu": "6",
        "Bảy": "7"
    }

    if (day === "Chủ Nhật" || day === "CN") return "Chủ Nhật"
    
    // Check if it's already "Thứ 2", "Thứ 3" etc
    if (day.match(/Thứ \d+/)) return day

    // Handle "Thứ Hai", "Thứ Ba"
    const parts = day.split(" ")
    if (parts.length === 2 && parts[0] === "Thứ") {
        const num = map[parts[1]]
        if (num) return `Thứ ${num}`
    }
    
    // Fallback or just return original
    return day
}

export default function SchedulePage() {
  const [data, setData] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    async function fetchSchedule() {
        try {
            const res = await getSchedule()
            setData(res)
            // Try to find "Today" to set active tab
            // (Simulated logic: just default to first or find matching date)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchSchedule()
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải lịch chiếu...</div>

  const activeDay = data[activeTab]

  return (
    <div className="container mx-auto py-12 px-4">
        <GlassPanel className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-400" />
                Lịch Chiếu Phim
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {data.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${activeTab === i 
                                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >
                        {formatDay(item.day)}
                        <span className="block text-xs opacity-70 font-normal">
                             {item.date}/{item.month}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            {activeDay && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {activeDay.items.map((anime, i) => (
                         <Link 
                            key={i}
                            href={anime.path || "#"}
                            className="group block"
                        >
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                                <Image
                                    src={anime.image}
                                    alt={anime.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white">
                                    {anime.chap || "??"}
                                </div>
                            </div>
                             <h3 className="text-white font-medium line-clamp-2 text-sm group-hover:text-green-400 transition-colors">
                                {anime.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            )}
        </GlassPanel>
    </div>
  )
}
