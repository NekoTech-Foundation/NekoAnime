"use client"

import { useAuthStore } from "@/hooks/useAuthStore"
import { LogOut, User, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface UserProfileProps {
  isCollapsed: boolean
  onOpenLogin: () => void
}

export function UserProfile({ isCollapsed, onOpenLogin }: UserProfileProps) {
  const { user, isLogged, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  if (!isLogged()) {
    return (
      <button
        onClick={onOpenLogin}
        className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors group text-left",
            isCollapsed ? "justify-center" : ""
        )}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/30 transition-colors">
          <User className="w-5 h-5 text-indigo-300" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-200 group-hover:text-white">Khách</p>
            <p className="text-xs text-indigo-400">Nhấn để đăng nhập</p>
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors group text-left",
            isCollapsed ? "justify-center" : ""
        )}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || "U"}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {showMenu && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-[#1A1A24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-1"
          >
             <button
                onClick={() => {
                   logout()
                   setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-sm"
            >
                <LogOut className="w-4 h-4" />
                Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
