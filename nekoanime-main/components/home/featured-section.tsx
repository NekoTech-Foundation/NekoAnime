"use client"


import { Play, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AnimeItem } from "@/lib/api/parser"
import { getProxiedImageUrl } from "@/lib/utils"

interface FeaturedSectionProps {
    data: {
        latestUpdate: AnimeItem[]
        nominate: AnimeItem[]
    }
}

export function FeaturedSection({ data }: FeaturedSectionProps) {
  if (!data) return null

  // Render Latest Updates
  return (
    <div className="space-y-12">
        <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white/90">
            <span className="w-1 h-8 bg-indigo-500 rounded-full" />
            Mới Cập Nhật
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data.latestUpdate.map((anime, i) => (
                    <Link key={i} href={anime.path || "#"} className="group relative block">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                            <Image
                                src={getProxiedImageUrl(anime.image) || "/placeholder.svg"}
                                alt={anime.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {(anime.chap && anime.chap !== "0" && anime.chap !== "?" && anime.chap !== "???") ? (
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium text-white border border-white/10">
                                    {anime.chap.startsWith("Tập") ? anime.chap : `Tập ${anime.chap}`}
                                </div>
                            ) : null}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-indigo-500 hover:border-indigo-500 transition-colors cursor-pointer">
                                    <Play className="w-6 h-6 text-white ml-1 fill-white" />
                                </div>
                            </div>
                        </div>

                        <h3 className="font-medium text-white/90 truncate group-hover:text-indigo-400 transition-colors" title={anime.name}>
                            {anime.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {anime.rate || "N/A"}
                            </span>
                            <span>{anime.views ? `${anime.views.toLocaleString()} views` : ""}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

         <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white/90">
            <span className="w-1 h-8 bg-pink-500 rounded-full" />
            Anime Đề Cử
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {data.nominate.map((anime, i) => (
                    <Link key={i} href={anime.path || "#"} className="group relative block">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                             <Image
                                src={getProxiedImageUrl(anime.image) || "/placeholder.svg"}
                                alt={anime.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                            <div className="absolute top-2 left-2 bg-pink-600/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg">
                                HOT
                            </div>
                        </div>
                        <h3 className="font-medium text-white/90 truncate group-hover:text-pink-400 transition-colors">{anime.name}</h3>
                    </Link>
                 ))}
            </div>
        </section>
    </div>
  )
}
