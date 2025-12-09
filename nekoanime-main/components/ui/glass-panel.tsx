
import { cn } from "@/lib/utils"
import React from "react"

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "neko" | "default" | "heavy"
}

export function GlassPanel({ className, children, variant = "default", ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 backdrop-blur-md shadow-lg",
        variant === "default" && "bg-black/40",
        variant === "neko" && "bg-indigo-900/30 border-indigo-500/20",
        variant === "heavy" && "bg-black/70 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
