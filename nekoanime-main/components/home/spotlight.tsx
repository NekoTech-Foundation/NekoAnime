"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AnimeItem } from "@/lib/api/parser"
import Link from "next/link"

interface SpotlightProps {
  items: AnimeItem[]
}

export function Spotlight({ items }: SpotlightProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextSlide = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + items.length) % items.length)
  }

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(timer)
  }, [current])

  if (!items || items.length === 0) return null

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const item = items[current]

  return (
    <section className="relative h-[500px] w-full rounded-3xl overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image})` }}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 z-20 max-w-xl w-full">
        <GlassPanel className="p-6 backdrop-blur-2xl bg-black/60 border-white/10 shadow-2xl rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`content-${current}`}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-pink-600/20 uppercase tracking-wider">
                HOT
              </span>
              {(item.chap && item.chap !== "0" && item.chap !== "?" && item.chap !== "???") ? (
                  <span className="text-gray-300 text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                    {item.chap}
                  </span>
              ) : null}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-tight line-clamp-1">
              {item.name}
            </h1>
            
            <p className="text-gray-200 line-clamp-3 mb-5 text-sm max-w-lg opacity-90 font-light leading-relaxed">
             {item.description && item.description.length > 20 
                ? item.description 
                : "Hãy cùng khám phá bộ anime hấp dẫn này ngay tại NekoAnime. Những tình tiết gay cấn và hình ảnh tuyệt đẹp đang chờ đón bạn."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={item.path || "#"}>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:scale-95 text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Xem Ngay
                </button>
              </Link>
              
              <Link href={item.path || "#"}>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium transition-all border border-white/10 backdrop-blur-md hover:-translate-y-0.5 active:scale-95 text-sm">
                  <Info className="w-4 h-4" />
                  Chi Tiết
                </button>
              </Link>
            </div>
          </motion.div>
        </GlassPanel>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-4">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all active:scale-90 group/btn"
        >
          <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all active:scale-90 group/btn"
        >
          <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
         {items.map((_, idx) => (
             <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === current ? "w-8 bg-indigo-500" : "bg-white/50"}`}
             />
         ))}
      </div>
    </section>
  )
}
