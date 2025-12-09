
"use client"

import { useEffect, useState } from "react"
import { getPlayerLink } from "@/lib/logic/player-link"
import { HlsExtensionLoader } from "./hls-loader"
import ReactPlayer from "react-player"
import HlsPlayer from "./hls-player"
import { Loader2, AlertCircle } from "lucide-react"

interface NPlayerProps {
    episode: { id: string, play: string, hash: string }
    poster?: string
}

// Cast to any to avoid "url does not exist" type error that toggles between existing and not existing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

export function NPlayer({ episode, poster }: NPlayerProps) {
    const [sources, setSources] = useState<{ file: string, type: string, label: string }[]>([])
    const [currentSourceIdx, setCurrentSourceIdx] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!episode) return

        async function loadStream() {
            setLoading(true)
            setError(null)
            setSources([])
            setCurrentSourceIdx(0)

            try {
                // Fetch the link
                console.log("[Player] Fetching link for:", episode)
                const linkData = await getPlayerLink({
                    id: episode.id,
                    play: episode.play,
                    hash: episode.hash
                })
                console.log("[Player] Got linkData:", linkData)

                // Sort sources: HLS first, then others
                const sortedLinks = linkData.link.sort((a, b) => {
                    if (a.type === 'hls' && b.type !== 'hls') return -1
                    if (a.type !== 'hls' && b.type === 'hls') return 1
                    return 0
                })

                if (sortedLinks.length > 0) {
                    setSources(sortedLinks)
                } else {
                    throw new Error("No compatible stream found")
                }

            } catch (err: unknown) {
                console.error("Player Error", err)
                setError(err instanceof Error ? err.message : "Lỗi khi tải video")
            } finally {
                setLoading(false)
            }
        }

        loadStream()
    }, [episode])

    const handlePlayerError = (e: any) => {
        console.error("[Player] Source failed:", sources[currentSourceIdx], e)

        if (currentSourceIdx < sources.length - 1) {
            console.log("[Player] Switching to next source...")
            setCurrentSourceIdx(prev => prev + 1)
        } else {
            setError("Không thể phát video này (Đã thử tất cả server)")
        }
    }

    if (!episode) return null

    const activeSource = sources[currentSourceIdx]
    // Check if source requires HLS forcing (Data URI or m3u8 extension)
    const isHls = activeSource?.type === 'hls' || (activeSource?.file && (activeSource.file.includes('.m3u8') || activeSource.file.startsWith('data:application/vnd.apple.mpegurl') || activeSource.file.startsWith('blob:')))

    // Check for extension availability
    const [extReady, setExtReady] = useState(false)

    useEffect(() => {
        // Check immediately
        // @ts-ignore
        if (typeof window !== 'undefined' && window.NekoHelper) {
            setExtReady(true)
        }

        // Also listen for potential lazy injection (optional)
        const checkInterval = setInterval(() => {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.NekoHelper) {
                setExtReady(true)
                clearInterval(checkInterval)
            }
        }, 1000)

        return () => clearInterval(checkInterval)
    }, [])

    useEffect(() => {
        // @ts-ignore
        if (extReady && window.NekoHelper) {
            console.log("[NPlayer] Testing Extension Connection...")
            // @ts-ignore
            window.NekoHelper.fetch('https://httpbin.org/get').then((res) => {
                console.log("[NPlayer] Extension Test Success:", res.status)
            }).catch((err: any) => {
                console.error("[NPlayer] Extension Test Failed:", err)
            })
        }
    }, [extReady])

    return (
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            {/* ... loadings ... */}

            {activeSource && !loading && !error && (
                <div className="w-full h-full">
                    {isHls ? (
                        <HlsPlayer
                            key={activeSource.file}
                            src={activeSource.file}
                            poster={poster}
                            onError={handlePlayerError}
                            autoPlay={false}
                        />
                    ) : (
                        <ReactPlayerAny
                            key={activeSource.file}
                            url={activeSource.file}
                            width="100%"
                            height="100%"
                            controls
                            onReady={() => console.log("[Player] onReady")}
                            onStart={() => console.log("[Player] onStart")}
                            onBuffer={() => console.log("[Player] onBuffer")}
                            onError={(e: any) => {
                                console.error("[Player] onError", e)
                                handlePlayerError(e)
                            }}
                            config={{
                                file: {
                                    attributes: {
                                        crossOrigin: "anonymous",
                                        poster: poster
                                    }
                                }
                            } as any}
                        />
                    )}
                </div>
            )}

            {/* Source Indicator (Optional Debug) */}
             <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
                 <div className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                    Source: {currentSourceIdx + 1}/{sources.length} ({activeSource?.type})
                 </div>
                 <div className={`px-2 py-1 text-xs rounded transition-colors ${
                     extReady ? "bg-green-500/50 text-green-100" : "bg-red-500/50 text-red-100"
                 }`}>
                     Ext: {extReady ? "Ready" : "Missing"}
                 </div>
             </div>
        </div>
    )
}
