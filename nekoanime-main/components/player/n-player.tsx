```typescript
import { useEffect, useState, useRef } from "react"
import { getPlayerLink } from "@/lib/logic/player-link"
import ReactPlayer from "react-player"
import HlsPlayer from "./hls-player"

import { setProgress } from "@/lib/api/history"
import { useAuthStore } from "@/hooks/useAuthStore"

interface NPlayerProps {
    episode: { id: string, play: string, hash: string, name: string }
    poster?: string
    seasonId?: string
    seasonName?: string
}

// Cast to any to avoid "url does not exist" type error that toggles between existing and not existing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

export function NPlayer({ episode, poster, seasonId, seasonName }: NPlayerProps) {
    const [sources, setSources] = useState<{ file: string, type: string, label: string }[]>([])
    const [currentSourceIdx, setCurrentSourceIdx] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // History tracking
    const updateTimeout = useRef<NodeJS.Timeout | null>(null)
    const { isLogged, uid } = useAuthStore()
    
    const handleProgress = (state: { playedSeconds: number, played: number, loaded: number, loadedSeconds: number }) => {
        if (!isLogged() || !seasonId || !seasonName) return

        // Debounce update every 10 seconds
        if (!updateTimeout.current) {
             updateTimeout.current = setTimeout(async () => {
                const userUid = uid()
                if (!userUid) return

                try {
                     await setProgress(userUid, seasonId, episode.id, {
                        name: episode.name,
                        poster: poster || "",
                        season_name: seasonName
                     }, {
                        cur: state.playedSeconds,
                        dur: state.playedSeconds / (state.played || 0.01), // Estimate duration or use if available. state.played = cur / dur => dur = cur / played
                        name: episode.name
                     })
                } catch (e) {
                    console.error("Failed to save progress", e)
                } finally {
                    updateTimeout.current = null
                }
             }, 10000)
        }
    }
    
    // Clear timeout on unmount or episode change
    useEffect(() => {
        return () => {
            if (updateTimeout.current) clearTimeout(updateTimeout.current)
        }
    }, [episode])

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

    const handlePlayerError = (e: unknown) => {
        console.error("[Player] Source failed:", sources[currentSourceIdx], e)

        if (currentSourceIdx < sources.length - 1) {
            console.log("[Player] Switching to next source...")
            setCurrentSourceIdx(prev => prev + 1)
        } else {
            setError("Không thể phát video này (Đã thử tất cả server)")
        }
    }
    
    // Render logic
    const activeSource = sources[currentSourceIdx]
    const isHls = activeSource?.type === 'hls' || (activeSource?.file && (activeSource.file.includes('.m3u8') || activeSource.file.startsWith('data:application/vnd.apple.mpegurl') || activeSource.file.startsWith('blob:')))

    if (!episode) return null

    return (
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            {/* Loading Overlay */}
            {loading && (
                 <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 text-white">
                     Loading...
                 </div>
            )}
            
            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 text-red-500 p-4 text-center">
                    <p>{error}</p>
                </div>
            )}

            {activeSource && !loading && !error && (
                <div className="w-full h-full">
                    {isHls ? (
                        <HlsPlayer
                            key={activeSource.file}
                            src={activeSource.file}
                            poster={poster}
                            onError={handlePlayerError}
                            onProgress={handleProgress}
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
                            onProgress={handleProgress}
                            onError={(e: unknown) => {
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
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
```
