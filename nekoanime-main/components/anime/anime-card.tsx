
"use client"

import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { AnimeItem } from "@/lib/api/parser/helpers"
import { cn, getProxiedImageUrl } from "@/lib/utils"

interface AnimeCardProps {
    item: AnimeItem
    className?: string
}

export function AnimeCard({ item, className }: AnimeCardProps) {
    return (
        <Link 
            href={item.path}
            className={cn(
                "group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5",
                className
            )}
        >
            {item.image && (
                <Image
                    src={getProxiedImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors text-sm">
                    {item.name}
                </h3>
                <div className="flex justify-between items-center mt-1">

                    <p className="text-xs text-gray-400 truncate max-w-[70%]">
                        {item.othername || ""}
                    </p>
                    {(item.chap && item.chap !== "0" && item.chap !== "?" && item.chap !== "???") || (item.process && item.process !== "0" && item.process !== "?" && item.process !== "???") ? (
                        <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white/90">
                            {(() => {
                                const text = item.chap || item.process;
                                return text?.startsWith("Tập") ? text : `Tập ${text}`
                            })()}
                        </span>
                    ) : null}
                </div>
            </div>
            
            {/* Hover info */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 text-xs text-white space-y-1">
                        <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{item.rate || 0}</span>
                        </div>
                </div>
            </div>
        </Link>
    )
}
