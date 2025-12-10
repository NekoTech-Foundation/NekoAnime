"use client"

import { useHistoryStore } from "@/hooks/useHistoryStore"
import { useEffect } from "react"
import { PlayCircle, Clock } from "lucide-react"
import { useAuthStore } from "@/hooks/useAuthStore"
import Link from "next/link"

export function HistoryList() {
  const { items, loading, hasMore, fetchPage, page, refresh, error } = useHistoryStore()
  const isLogged = useAuthStore(s => s.isLogged())

  useEffect(() => {
    if (isLogged) {
        refresh()
    }
  }, [isLogged]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLogged) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-xl font-bold text-white mb-2">Bạn chưa đăng nhập</h2>
            <p className="text-gray-400">Vui lòng đăng nhập để xem lịch sử.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <Link 
            href={`/xem-phim/${item.season}/${item.episode}`} 
            key={`${item.id}-${item.episode}`}
            className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all"
          >
             <img 
                src={item.poster} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
             />
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                <h3 className="text-white font-medium line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Tập {item.episode}
                    </span>
                    {item.timestamp && (
                         <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
             </div>
          </Link>
        ))}
      </div>

      {loading && (
          <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
      )}

      {/* Pagination Controls Removed as per request (Single page 30 items) */}


      {/* Empty State - Left aligned as requested */}
      {!loading && items.length === 0 && !error && (
         <div className="text-left py-12 text-gray-500">
             Chưa có lịch sử xem
         </div>
      )}
    </div>
  )
}
