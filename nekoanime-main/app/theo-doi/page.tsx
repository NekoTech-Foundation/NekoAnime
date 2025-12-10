
"use client"

import { useEffect } from "react"
import { useFollowStore } from "@/hooks/useFollowStore"
import { useAuthStore } from "@/hooks/useAuthStore"
import { AnimeGrid } from "@/components/anime/anime-grid"
import { Loader2, Heart } from "lucide-react"

export default function FollowedPage() {
    const { items, fetchList, loadMore, loading } = useFollowStore()
    const { isLogged } = useAuthStore()
    
    useEffect(() => {
        if (isLogged()) {
            fetchList(1)
        }
    }, [isLogged]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!isLogged()) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Bạn chưa đăng nhập</h2>
                <p className="text-gray-400">Vui lòng đăng nhập để xem danh sách anime đang theo dõi.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-caveat mb-2">
                        Anime Đang Theo Dõi
                    </h1>
                    <p className="text-gray-400 text-sm">Danh sách anime bạn đã đánh dấu yêu thích</p>
                </div>
            </div>

            <AnimeGrid items={items} />

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            )}
            
            {/* Infinite scroll trigger could be added here, or simple load more button */}
             <div className="h-4" />
        </div>
    )
}
