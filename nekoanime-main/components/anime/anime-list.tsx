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
    { label: "Action", value: "hanh-dong" },
    { label: "Adventure", value: "phieu-luu" },
    { label: "Boys Love", value: "dong-tinh-nam" },
    { label: "Cartoon", value: "cartoon" },
    { label: "Cổ Trang", value: "co-trang" },
    { label: "Comedy", value: "hai-huoc" },
    { label: "Dementia", value: "dien-loan" },
    { label: "Demons", value: "demons" },
    { label: "Drama", value: "drama" },
    { label: "Ecchi", value: "ecchi" },
    { label: "Fantasy", value: "phep-thuat" },
    { label: "Game", value: "tro-choi" },
    { label: "Harem", value: "harem" },
    { label: "Historical", value: "lich-su" },
    { label: "Horror", value: "kinh-di" },
    { label: "Josei", value: "josei" },
    { label: "Kids", value: "tre-em" },
    { label: "Live Action", value: "live-action" },
    { label: "Magic", value: "ma-thuat" },
    { label: "Martial Arts", value: "martial-arts" },
    { label: "Mecha", value: "mecha" },
    { label: "Military", value: "quan-doi" },
    { label: "Music", value: "am-nhac" },
    { label: "Mystery", value: "mystery" },
    { label: "Parody", value: "parody" },
    { label: "Police", value: "police" },
    { label: "Psychological", value: "psychological" },
    { label: "Romance", value: "tinh-cam" },
    { label: "Samurai", value: "samurai" },
    { label: "School", value: "truong-hoc" },
    { label: "Sci-Fi", value: "sci-fi" },
    { label: "Seinen", value: "seinen" },
    { label: "Shoujo", value: "shoujo" },
    { label: "Shoujo Ai", value: "shoujo-ai" },
    { label: "Shounen", value: "shounen" },
    { label: "Shounen Ai", value: "shounen-ai" },
    { label: "Slice of Life", value: "doi-thuong" },
    { label: "Space", value: "space" },
    { label: "Sports", value: "the-thao" },
    { label: "Super Power", value: "super-power" },
    { label: "Supernatural", value: "sieu-nhien" },
    { label: "Suspense", value: "hoi-hop" },
    { label: "Thriller", value: "thriller" },
    { label: "Tokusatsu", value: "tokusatsu" },
    { label: "Vampire", value: "vampire" },
    { label: "Yaoi", value: "yaoi" },
    { label: "Yuri", value: "yuri" },
]

const YEARS = [
    { label: "Tất cả", value: "" },
    { label: "2025", value: "2025" },
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
    { label: "2019", value: "2019" },
    { label: "2018", value: "2018" },
    { label: "2017", value: "2017" },
    { label: "2016", value: "2016" },
    { label: "2015", value: "2015" },
    { label: "2014", value: "2014" },
    { label: "2013", value: "2013" },
    { label: "Cũ hơn", value: "cu-hon" },
]

const SEASONS = [
    { label: "Tất cả", value: "" },
    { label: "Đông(Winter)", value: "winter" },
    { label: "Xuân(Spring)", value: "spring" },
    { label: "Hạ(Summer)", value: "summer" },
    { label: "Thu(Autumn)", value: "autumn" },
]

const TYPES = [
    { label: "Tất cả", value: "" },
    { label: "Anime lẻ(Movie/OVA)", value: "/anime-le" },
    { label: "Anime bộ(TV-Series)", value: "/anime-bo" },
    { label: "Anime trọn bộ", value: "/danh-sach/list-tron-bo" },
    { label: "Anime đang chiếu", value: "/danh-sach/list-dang-chieu" },
    { label: "Anime sắp chiếu", value: "/anime-sap-chieu" },
    { label: "HH Trung Quốc", value: "/hoat-hinh-trung-quoc" },
]

const SORTS = [
    { label: "Mới nhất", value: "" },
    { label: "Tên: A-Z", value: "title_az" },
    { label: "Tên: Z-A", value: "title_za" },
    { label: "Xem nhiều nhất", value: "views" },
    { label: "Nhiều lượt bình chọn", value: "votes" },
]

interface AnimeListProps {
    initialGenre?: string
    initialYear?: string
    initialSort?: string
}

export default function AnimeList({ initialGenre = "", initialYear = "", initialSort = "" }: AnimeListProps) {
    const [data, setData] = useState<AnimeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [maxPage, setMaxPage] = useState(1)
    
    // Filters - reverted to single string for reliability
    const [genre, setGenre] = useState<string>(initialGenre || "")
    const [filters, setFilters] = useState({
        year: initialYear,
        season: "",
        type: "",
        sort: initialSort,
        page: 1
    })

    useEffect(() => {
        if(initialGenre) setGenre(initialGenre)
        setFilters(prev => ({
            ...prev,
            year: initialYear,
            sort: initialSort,
            page: 1
        }))
    }, [initialGenre, initialYear, initialSort])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Priority Construction:
                // 1. Type Path (if selected)
                // 2. Genre Path (if selected and no Type)
                // 3. Year Path (if selected and no Genre/Type)
                // 4. Default
                
                let path = "/danh-sach/phim-moi"
                let isCustomPath = false

                if (filters.type) {
                    path = filters.type
                    isCustomPath = true
                } else if (genre) {
                    path = `/the-loai/${genre}`
                    isCustomPath = true
                } else if (filters.year) {
                    path = `/nam/${filters.year}`
                    isCustomPath = true
                }

                const query: Record<string, string> = {}
                
                // If we are using a Type path, we can try to append year/sort
                // If we are using Genre path, we can append year/sort
                
                if (filters.sort) query['sort'] = filters.sort
                if (filters.season) query['season'] = filters.season
                
                // Only add year query if it's NOT the base path
                if (filters.year && path !== `/nam/${filters.year}`) {
                    query['year'] = filters.year
                }

                // If user selected Type but ALSO Genre?
                // Since we use Single Base Path, we can't easily intersect defined paths.
                // We'll prioritize Type (as it's often a broader category or specific view).
                // Or we could ignore Genre if Type is set. 
                // Alternatively, if server supports ?genre=... we could try.
                // But we saw 500s. 
                // So strictly enforcing 1 primary filter path is safest.

                const res = await getList(path, filters.page, query)
                setData(res.items)
                setMaxPage(res.maxPage)
            } catch (e) {
                console.error(e)
                setData([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [filters, genre])

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const handleGenreChange = (value: string) => {
        // Toggle off if same value clicked
        if (genre === value) {
            setGenre("")
        } else {
            setGenre(value)
        }
        setFilters(f => ({ ...f, page: 1 }))
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <GlassPanel className="p-6">
                <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
                    <Filter className="w-5 h-5 text-indigo-400" />
                    Bộ lọc tìm kiếm
                </div>
                
                <div className="space-y-4">
                     {/* Single Select Genres */}
                     <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                             <span className="text-sm font-bold text-white min-w-[80px] shrink-0 pt-1">Thể loại:</span>
                             <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {GENRES.map((opt) => {
                                    const isActive = genre === opt.value
                                    
                                    return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleGenreChange(opt.value)}
                                        className={`
                                            text-sm transition-colors hover:text-indigo-400
                                            ${isActive ? "text-indigo-400 font-bold" : "text-gray-400"}
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                )})}
                             </div>
                        </div>
                     </div>

                    <div className="h-px bg-white/5" />
                    
                    <FilterRow 
                        label="Sắp xếp" 
                        options={SORTS} 
                        value={filters.sort} 
                        onChange={(v) => handleFilterChange('sort', v)} 
                    />
                    
                     <div className="h-px bg-white/5" />

                     <FilterRow 
                        label="Loại" 
                        options={TYPES} 
                        value={filters.type} 
                        onChange={(v) => handleFilterChange('type', v)} 
                    />

                    <div className="h-px bg-white/5" />

                    <FilterRow 
                        label="Mùa" 
                        options={SEASONS} 
                        value={filters.season} 
                        onChange={(v) => handleFilterChange('season', v)} 
                    />

                    <div className="h-px bg-white/5" />
                    
                    <FilterRow 
                        label="Năm" 
                        options={YEARS} 
                        value={filters.year} 
                        onChange={(v) => handleFilterChange('year', v)} 
                    />
                </div>
            </GlassPanel>

            {/* Results Grid - Keeping same as before */}
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-8">
                    {data.length === 0 ? (
                        <div className="text-center text-white py-10">
                            Không tìm thấy kết quả nào. <br/>
                            <span className="text-sm text-gray-400">Thử bỏ bớt bộ lọc hoặc chọn mục khác.</span>
                        </div>
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
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <span className="text-sm font-bold text-white min-w-[80px] shrink-0">{label}:</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {options.map((opt) => {
                     const isActive = value === opt.value
                     return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`
                            text-sm transition-colors hover:text-indigo-400
                            ${isActive ? "text-indigo-400 font-bold" : "text-gray-400"}
                        `}
                    >
                        {opt.label}
                    </button>
                )})}
            </div>
        </div>
    )
}
