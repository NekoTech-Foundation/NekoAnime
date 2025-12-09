"use client"

import { GlassPanel } from "@/components/ui/glass-panel"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 pt-10 pb-6">
       <div className="flex flex-col items-center justify-center gap-4 text-center">
            <GlassPanel className="px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
                 <span>Made with</span>
                 <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                 <span>for anime fans</span>
            </GlassPanel>

            <div className="max-w-2xl px-4 space-y-2">
                <p className="text-gray-500 text-sm">
                   Toàn bộ anime được sử dụng tại trang <span className="text-indigo-400 font-bold">ĐỀU KHÔNG</span> thuộc NekoAnime.
                </p>
                <p className="text-gray-500 text-xs">
                   Trang sử dụng nguồn từ <a href="http://bit.ly/animevietsubtv" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">AnimeVietsub</a>
                </p>
            </div>
       </div>
    </footer>
  )
}
