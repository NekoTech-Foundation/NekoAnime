"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/hooks/useAuthStore"
import { ArrowLeft, Facebook, Twitter } from "lucide-react" // Map Tabler brand icons
import Link from "next/link"
import { motion } from "framer-motion"

export default function UserPage() {
  const params = useParams()
  const { user, isLogged } = useAuthStore()
  const router = useRouter()
  
  // Unwrap params using React.use() or just access it if Next 15+ allows. 
  // In Next 15, params is a Promise. But in client component, useParams hook gives values.
  // Wait, params from page props is a Promise in Next 15 Server Components.
  // useParams() hook works in Client Components.

  const userId = params?.id as string

  // Simple mock or check
  const isMe = userId === "me" || (user && user.email && userId === "me") // Simplify for now
  
  // If not logged in and accessing 'me', redirect
  React.useEffect(() => {
     if (userId === 'me' && !isLogged()) {
         router.push('/')
     }
  }, [userId, isLogged, router])

  if (!user && userId === 'me') return null // Wait for hydration

  const displayUser = isMe ? user : { 
      name: "Người dùng Neko", 
      avatar: undefined, 
      email: "guest@neko",
      username: "Guest",
      sex: "unknown" as const
  } 

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={20} />
        <span>Quay Lại</span>
      </Link>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-gradient-to-br from-violet-900/30 to-slate-950 rounded-[20px] md:rounded-[30px] p-4 md:p-6 shadow-xl border border-white/5"
      >
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
          <div className="relative group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUser?.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                alt={displayUser?.name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white/5 group-hover:border-accent-primary transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-2 py-1 bg-accent-primary rounded-full">New</span>
              </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">{displayUser?.name}</h1>
            <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
               <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Member</span>
               <span>Tham gia từ 2024</span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
               {/* Social placeholders */}
               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#1877F2] hover:text-white transition-all">
                   <Facebook size={20} />
               </button>
               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#1DA1F2] hover:text-white transition-all">
                   <Twitter size={20} />
               </button>
            </div>
          </div>
          
          {/* Stats Box */}
          <div className="bg-black/20 rounded-2xl p-4 flex flex-col justify-center min-w-[200px]">
               <div className="text-center">
                   <p className="text-3xl font-bold text-accent-primary">0</p>
                   <p className="text-sm text-white/50 uppercase tracking-wide">Anime Đã Xem</p>
               </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs / Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-card-bg rounded-[30px] p-6 min-h-[400px]">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <span className="w-1 h-6 bg-accent-primary rounded-full"></span>
                      Kho Anime
                  </h2>
                  <div className="flex flex-col items-center justify-center h-[300px] text-white/30">
                      <Box size={48} className="mb-4 opacity-50" />
                      <p>Chưa có anime nào trong kho</p>
                  </div>
              </div>
          </div>
          
          <div className="space-y-6">
               <div className="bg-card-bg rounded-[30px] p-6">
                  <h2 className="text-xl font-bold mb-4">Hoạt Động</h2>
                  <div className="space-y-4">
                      {/* Activity Feed Placeholder */}
                      <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                          <div>
                              <p className="text-sm text-white">Đã đăng nhập thành công</p>
                              <p className="text-xs text-white/40">Vừa xong</p>
                          </div>
                      </div>
                  </div>
               </div>
          </div>
      </div>
    </div>
  )
}

function Box({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5"/>
            <path d="M12 22V12"/>
        </svg>
    )
}
