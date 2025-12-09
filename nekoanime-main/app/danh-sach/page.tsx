"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { AnimeItem } from "@/lib/api/parser"
import { getList } from "@/lib/api/list"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Filter, Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react"

// --- Constants ---
const GENRES = [
    { label: "Tất cả", value: "" },
    { label: "Hành Động", value: "hanh-dong" },
    { label: "Viễn Tưởng", value: "vien-tuong" },
    { label: "Lãng Mạn", value: "lang-man" },
    { label: "Kinh Dị", value: "kinh-di" },
    { label: "Hài Hước", value: "hai-huoc" },
    { label: "Phiêu Lưu", value: "phieu-luu" },
    { label: "Học Đường", value: "hoc-duong" },
    { label: "Đời Thường", value: "doi-thuong" },
    { label: "Thể Thao", value: "the-thao" },
    { label: "Âm Nhạc", value: "am-nhac" },
    { label: "Gia Đình", value: "gia-dinh" },
]

const YEARS = [
    { label: "Tất cả", value: "" },
    { label: "2025", value: "2025" },
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
]

const SORTS = [
    { label: "Mới cập nhật", value: "" },
    { label: "Xem nhiều", value: "views" },
    { label: "Yêu thích", value: "likes" },
]

export default function ListPage() {
    const [data, setData] = useState<AnimeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [maxPage, setMaxPage] = useState(1)
    
    // Filters
    const [filters, setFilters] = useState({
        genre: "",
        year: "",
        season: "",
        sort: "",
        page: 1
    })

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Determine base path based on primary filter (Genre usually takes precedence in path structure)
                // e.g. /the-loai/hanh-dong or /danh-sach/phim-moi
                // This is a simplified mapping. Real app might need more complex route building.
                let path = "/danh-sach/phim-moi"
                if (filters.genre) {
                    path = `/the-loai/${filters.genre}`
                } else if (filters.year) {
                   path = `/nam/${filters.year}`
                    // If both year and season, it might be different, but let's stick to simple single-path + query for now
                    // Note: Upstream might not support query params mixed with paths perfectly, but we try.
                }

                // Query params for others
                const query: Record<string, string> = {}
                if (filters.sort) query['sort'] = filters.sort
                if (filters.season) query['season'] = filters.season

                const res = await getList(path, filters.page, query)
                setData(res.items)
                setMaxPage(res.maxPage)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [filters])

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Filters Section */}
            <GlassPanel className="p-6">
                <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
                    <Filter className="w-5 h-5 text-indigo-400" />
                    Bộ lọc tìm kiếm
                </div>
                
                <div className="space-y-4">
                     <FilterRow 
                        label="Thể loại" 
                        options={GENRES} 
                        value={filters.genre} 
                        onChange={(v) => handleFilterChange('genre', v)} 
                    />
                    <div className="h-px bg-white/5" />
                    <FilterRow 
                        label="Năm phát hành" 
                        options={YEARS} 
                        value={filters.year} 
                        onChange={(v) => handleFilterChange('year', v)} 
                    />
                    <div className="h-px bg-white/5" />
                    {/* <FilterRow 
                        label="Mùa" 
                        options={SEASONS} 
                        value={filters.season} 
                        onChange={(v) => handleFilterChange('season', v)} 
                    />
                     <div className="h-px bg-white/5" /> */}
                    <FilterRow 
                        label="Sắp xếp" 
                        options={SORTS} 
                        value={filters.sort} 
                        onChange={(v) => handleFilterChange('sort', v)} 
                    />
                </div>
            </GlassPanel>

            {/* Results Grid */}
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-8">
                    {data.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">Không tìm thấy kết quả nào</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {data.map((item, i) => (
                                <Link 
                                    key={i} 
                                    href={item.path}
                                    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5"
                                >
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-4">
                                        <h3 className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors text-sm">
                                            {item.name}
                                        </h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-400 truncate max-w-[70%]">
                                                {item.othername}
                                            </p>
                                            <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white/90">
                                                {item.process}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover info */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 text-xs text-white space-y-1">
                                             <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span>TV Series</span>
                                             </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {maxPage > 1 && (
                        <div className="flex justify-center gap-2">
                             <button
                                onClick={() => setFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                                disabled={filters.page === 1}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <span className="px-4 py-2 rounded-lg bg-white/5 text-white font-medium min-w-[100px] text-center">
                                Trang {filters.page} / {maxPage}
                            </span>
                             <button
                                onClick={() => setFilters(prev => ({...prev, page: Math.min(maxPage, prev.page + 1)}))}
                                disabled={filters.page >= maxPage}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function FilterRow({ label, options, value, onChange }: { 
    label: string, 
    options: { label: string, value: string }[], 
    value: string, 
    onChange: (val: string) => void 
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-gray-400 min-w-[100px]">{label}:</span>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${value === opt.value 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
