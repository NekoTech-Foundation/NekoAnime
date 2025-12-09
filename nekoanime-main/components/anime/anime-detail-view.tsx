
"use client"

import { useAnimeData } from "@/hooks/use-anime-data"
import { GlassPanel } from "@/components/ui/glass-panel"
import { Play, Star, Eye, Clock, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { NPlayer } from "@/components/player/n-player"
import { cn } from "@/lib/utils"

interface AnimeDetailViewProps {
    slugParts: string[]
}

export default function AnimeDetailView({ slugParts }: AnimeDetailViewProps) {
    const isWatch = slugParts.length > 1
    const seasonSlug = slugParts[0]
    const currentChap = isWatch ? slugParts[1] : null

    const { detail, episodes, loading, error } = useAnimeData(seasonSlug)

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                     <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                     <p className="text-gray-400">Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    if (error || !detail) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <GlassPanel className="p-8 text-center bg-red-500/10 border-red-500/20">
                    <p className="text-red-400 mb-4">{error || "Không tìm thấy anime"}</p>
                    <Link href="/" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                        Về trang chủ
                    </Link>
                </GlassPanel>
            </div>
        )
    }

    const currentEpisode = isWatch && episodes.length > 0
        ? episodes.find(e => e.id === currentChap || e.id.endsWith(currentChap || "")) || episodes[0]
        : null

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             {/* Player Section OR Banner */}
             {/* Player Section OR Banner */}
            {isWatch && currentEpisode ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Player Area */}
                    <div className="lg:col-span-3 space-y-4">
                         <div className="flex items-center gap-4 mb-2">
                             <Link href={`/phim/${seasonSlug}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                 <ArrowLeft className="w-5 h-5 text-white" />
                             </Link>
                             <div className="min-w-0">
                                 <h1 className="text-lg font-bold text-white truncate">{detail.name}</h1>
                                 <p className="text-gray-400 text-xs truncate">Đang phát: <span className="text-indigo-400 font-medium">{currentEpisode.name}</span></p>
                             </div>
                         </div>

                         <NPlayer episode={currentEpisode} poster={detail.poster || detail.image} />
                         
                         {/* Mobile Info (visible below player) */}
                         <GlassPanel className="p-4 lg:hidden">
                            <h2 className="text-white font-bold mb-2">Thông tin phim</h2>
                             <p className="text-sm text-gray-300 line-clamp-3">{detail.description}</p>
                         </GlassPanel>
                    </div>

                    {/* Sidebar Episode List */}
                    <div className="lg:col-span-1">
                        <GlassPanel className="h-full max-h-[80vh] flex flex-col p-4 bg-black/40 backdrop-blur-xl border-white/10">
                            <div className="mb-4 pb-2 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                    <Play className="w-4 h-4 text-indigo-400" />
                                    Danh sách tập
                                </h3>
                                <span className="text-xs text-gray-500">{episodes.length} tập</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2">
                                <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                                    {episodes.map(ep => {
                                        const isActive = currentEpisode?.id === ep.id
                                        return (
                                        <Link
                                                key={ep.id}
                                                href={`/phim/${seasonSlug}/${ep.id}`}
                                                className={cn(
                                                    "h-9 flex items-center justify-center rounded text-xs font-medium transition-all border border-transparent",
                                                    isActive
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-indigo-400/50'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                                                )}
                                        >
                                            {ep.name}
                                        </Link>
                                    )})}
                                </div>
                                {episodes.length === 0 && (
                                    <div className="text-center text-gray-500 py-10 text-xs">Chưa có tập phim nào</div>
                                )}
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            ) : (
                <div className="relative h-[40vh] md:h-[50vh] w-full rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    {detail.poster && (
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-sm opacity-50"
                            style={{ backgroundImage: `url(${detail.poster})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent z-20" />

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-30 flex flex-col md:flex-row gap-8 items-end">
                        <div className="relative w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 hidden md:block">
                            {detail.image && (
                            <Image src={detail.image} alt={detail.name} fill className="object-cover" />
                            )}
                        </div>

                        <div className="flex-1 text-white space-y-4 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold font-caveat text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                {detail.name}
                            </h1>
                            <h2 className="text-lg text-gray-400 font-medium">{detail.othername}</h2>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-300 items-center">
                                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 font-bold">{detail.rate}</span>
                                    <span className="text-xs opacity-60">({detail.count_rate} vote)</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {detail.views?.toLocaleString()} Views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {detail.duration}
                                </span>
                                <span className="bg-indigo-600/80 px-2 py-0.5 rounded text-xs border border-indigo-400/30">
                                    {detail.quality}
                                </span>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {detail.genres.map(g => (
                                    <Link key={g.href} href={g.href} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-xs">
                                        {g.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                {!isWatch && episodes.length > 0 && (
                                    <Link href={`/phim/${seasonSlug}/${episodes[0].id}`} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25">
                                        <Play className="w-5 h-5 fill-current" />
                                        Xem Ngay
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     {!isWatch && (
                         <GlassPanel className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5 text-indigo-400" />
                                Danh sách tập
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {episodes.map(ep => {
                                   const isActive = currentEpisode?.id === ep.id
                                   return (
                                   <Link
                                        key={ep.id}
                                        href={`/phim/${seasonSlug}/${ep.id}`}
                                        className={cn(
                                            "h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all border border-transparent",
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-indigo-400/50'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/10'
                                        )}
                                   >
                                       {ep.name}
                                   </Link>
                               )})}
                               {episodes.length === 0 && (
                                   <div className="col-span-full text-center text-gray-500 py-4">Chưa có tập phim nào</div>
                               )}
                            </div>
                        </GlassPanel>
                     )}

                     <GlassPanel className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Nội dung</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {detail.description}
                        </p>
                    </GlassPanel>

                     <GlassPanel className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Bình luận</h3>
                        <div className="text-center text-gray-500 py-8 italic">
                            Tính năng bình luận đang được phát triển...
                        </div>
                    </GlassPanel>
                </div>

                <div className="space-y-6">
                    <GlassPanel className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Thông tin</h3>
                        <div className="space-y-3 text-sm">
                             <InfoRow label="Trạng thái" value={detail.status} />
                             <InfoRow label="Quốc gia" value={detail.countries?.map(c => c.name).join(", ")} />
                             <InfoRow label="Đạo diễn" value={detail.authors?.map(A => A.name).join(", ")} />
                             <InfoRow label="Studio" value={detail.studio} />
                             <InfoRow label="Ngôn ngữ" value={detail.language} />
                             <InfoRow label="Năm phát hành" value={detail.yearOf?.toString()} />
                        </div>
                    </GlassPanel>

                     <GlassPanel className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Có thể bạn thích</h3>
                        <div className="space-y-4">
                            {detail.related?.map((item, i) => {
                                return (
                                <Link key={i} href={item.path || "#"} className="flex gap-3 group">
                                     <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 relative bg-white/5">
                                        {item.image && (
                                            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                     </div>
                                     <div className="flex-1 min-w-0 py-1">
                                         <h4 className="font-medium text-white/90 truncate group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                                         <p className="text-xs text-gray-500 mt-1">{item.chap}</p>
                                         <div className="flex items-center gap-1 mt-2 text-xs text-yellow-500">
                                             <Star className="w-3 h-3 fill-current" />
                                             {item.rate}
                                         </div>
                                     </div>
                                </Link>
                            )})}
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    )
}

function InfoRow({label, value}: {label: string, value?: string}) {
    if (!value) return null
    return (
        <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium text-right ml-4">{value}</span>
        </div>
    )
}
