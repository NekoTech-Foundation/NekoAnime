
"use client"

import { useEffect, useState } from "react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertCircle } from "lucide-react"

export function ExtensionCheck({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [hasExtension, setHasExtension] = useState(true)

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 20 // 2 seconds (100ms * 20)

    const checkExtension = () => {
        // cast to any to avoid "Property 'NekoHelper' does not exist on type 'Window'" if global type isn't loaded
        if ((window as any).NekoHelper) {
            setHasExtension(true)
            setIsReady(true)
            return
        }

        attempts++
        if (attempts >= maxAttempts) {
            setHasExtension(false)
            setIsReady(true)
        } else {
            setTimeout(checkExtension, 100)
        }
    }

    checkExtension()
  }, [])

  if (!isReady) return null

  if (!hasExtension) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
        <GlassPanel className="p-8 max-w-md w-full text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Chưa cài đặt Extension</h2>
            <p className="text-gray-400 mb-6">
                Bạn cần cài đặt hoặc cập nhật Extension NekoAnime Helper để sử dụng ứng dụng này.
            </p>
            <a
                href="https://github.com/NekoTech-Foundation/NekoAnime-Extension"
                target="_blank"
                rel="noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Tải Extension
            </a>
        </GlassPanel>
      </div>
    )
  }

  return <>{children}</>
}
