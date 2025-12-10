
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
            
            {/* Pagination */}
            {!loading && (items.length > 0) && (
                <div className="flex justify-center items-center space-x-2 py-8 overflow-x-auto">
                    <button
                        onClick={() => fetchList(items.length > 0 && 1 < useFollowStore.getState().curPage ? useFollowStore.getState().curPage - 1 : 1)}
                        disabled={useFollowStore.getState().curPage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        Trước
                    </button>
                    
                    <div className="flex items-center space-x-1">
                        {(() => {
                            const { curPage, maxPage } = useFollowStore.getState()
                            let pages = []
                            // Logic to show limited pages
                            const maxVisible = 5
                            let start = Math.max(1, curPage - 2)
                            let end = Math.min(maxPage, start + maxVisible - 1)
                            
                            if (end - start + 1 < maxVisible) {
                                start = Math.max(1, end - maxVisible + 1)
                            }

                            if (start > 1) {
                                pages.push(
                                    <button key="1" onClick={() => fetchList(1)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-sm font-medium ${curPage === 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>1</button>
                                )
                                if (start > 2) pages.push(<span key="dots1" className="text-gray-600 px-1">...</span>)
                            }

                            for (let i = start; i <= end; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => fetchList(i)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-sm font-medium ${
                                            curPage === i 
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                    >
                                        {i}
                                    </button>
                                )
                            }

                            if (end < maxPage) {
                                if (end < maxPage - 1) pages.push(<span key="dots2" className="text-gray-600 px-1">...</span>)
                                pages.push(
                                    <button key={maxPage} onClick={() => fetchList(maxPage)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-sm font-medium ${curPage === maxPage ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>{maxPage}</button>
                                )
                            }
                            return pages
                        })()}
                    </div>

                    <button
                        onClick={() => fetchList(useFollowStore.getState().curPage + 1)}
                        disabled={useFollowStore.getState().curPage >= useFollowStore.getState().maxPage}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        Sau
                    </button>
                </div>
            )}
             <div className="h-4" />
        </div>
    )
}
