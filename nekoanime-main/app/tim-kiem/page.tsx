"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { SearchResult, getSearch } from "@/lib/api/search"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  // Support both ?q= (standard) and custom route /tim-kiem/keyword if we used dynamic segments
  // But here we are at /tim-kiem/page.tsx, so we likely use query params ?keyword or ?q
  // Wait, the desktop app uses /tim-kiem/[keyword]. 
  // Next.js static route /tim-kiem/page.tsx needs query param unless we move it to /tim-kiem/[keyword]/page.tsx
  
  // Since I created /tim-kiem/page.tsx, the user likely visits /tim-kiem?q=abc
  // But to support the links from the site which might be /tim-kiem/abc, I should probably have created [keyword] folder.
  // For now I'll support query param `q`.
  
  const query = searchParams.get("q") || searchParams.get("keyword") || ""
  
  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!query) return

    async function fetchSearch() {
        setLoading(true)
        try {
            const res = await getSearch(query, page)
            setData(res)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchSearch()
  }, [query, page])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const keyword = formData.get("q") as string
      if (keyword) {
          window.location.href = `/tim-kiem?q=${encodeURIComponent(keyword)}`
      }
  }

  return (
    <div className="container mx-auto py-12 px-4">
        <GlassPanel className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-purple-400" />
                Tìm Kiếm
            </h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                <input 
                    name="q"
                    defaultValue={query}
                    placeholder="Nhập tên anime..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-lg font-medium transition-colors">
                    Tìm
                </button>
            </form>

            {!query && <div className="text-center text-gray-500 py-10">Nhập từ khóa để tìm kiếm...</div>}

            {loading && <div className="text-center text-gray-500 py-10">Đang tìm kiếm...</div>}

            {data && !loading && (
                <>
                    <p className="text-gray-400 mb-4">Tìm thấy kết quả cho "{query}" ({data.curPage}/{data.maxPage} trang)</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {data.items.map((anime, i) => (
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
                                 <h3 className="text-white font-medium line-clamp-2 text-sm group-hover:text-purple-400 transition-colors">
                                    {anime.name}
                                </h3>
                            </Link>
                        ))}
                    </div>

                    {/* Simple Pagination */}
                    <div className="flex justify-center gap-2 mt-8">
                        <button 
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 text-gray-400">Trang {page}</span>
                        <button 
                            disabled={page >= data.maxPage}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </GlassPanel>
    </div>
  )
}
