
"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Calendar, Trophy, Settings, Menu } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Tìm kiếm", href: "/tim-kiem", icon: Search },
  { label: "Danh sách", href: "/danh-sach", icon: Menu },
  { label: "Lịch chiếu", href: "/lich-chieu", icon: Calendar },
  { label: "Bảng xếp hạng", href: "/bang-xep-hang", icon: Trophy },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col glass border-r-0 border-white/5",
        "transition-all duration-300 ease-in-out"
      )}
      animate={{ width: isCollapsed ? 80 : 250 }}
    >
      <div className="h-16 flex items-center px-4 justify-between border-b border-white/5">
        {!isCollapsed && (
          <span className="font-caveat text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            NekoAnime
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-indigo-400")} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
             <Settings className="w-5 h-5 text-indigo-300" />
           </div>
           {!isCollapsed && (
             <div className="overflow-hidden">
               <p className="text-sm font-medium">Cài đặt</p>
               <p className="text-xs text-gray-500">Tùy chỉnh</p>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  )
}
