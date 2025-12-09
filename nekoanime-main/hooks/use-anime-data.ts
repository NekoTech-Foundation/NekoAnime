
import { useState, useEffect } from "react"
import { httpGet } from "@/lib/logic/http"
import { parseAnimeDetail, type AnimeDetail } from "@/lib/api/parser/detail"
import { parseEpisodeList, type Episode } from "@/lib/api/parser/episode"

export function useAnimeData(slug: string) {
    const [detail, setDetail] = useState<AnimeDetail | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!slug) return

        let mounted = true
        setLoading(true)
        setError(null)

        async function fetchData() {
            try {
                // Fetch strictly from client (browser extension)
                const res = await httpGet(`/phim/${slug}`)
                if (typeof res.data !== 'string') throw new Error("Invalid response")

                const det = parseAnimeDetail(res.data)
                let epData = parseEpisodeList(res.data)

                // If no episodes found on detail page (common now), try fetching the watch page
                if ((!epData.episodes || epData.episodes.length === 0) && det.watchUrl) {
                    try {
                        console.log("Fetching secondary watch page:", det.watchUrl)
                        const watchRes = await httpGet(det.watchUrl)
                        if (typeof watchRes.data === 'string') {
                            const watchEpData = parseEpisodeList(watchRes.data)
                            if (watchEpData.episodes.length > 0) {
                                epData = watchEpData
                            }
                        }
                    } catch (err) {
                        console.warn("Secondary fetch failed", err)
                    }
                }

                if (mounted) {
                    setDetail(det)
                    setEpisodes(epData.episodes)
                }
            } catch (e: unknown) {
                console.error("Fetch Error", e)
                if (mounted) {
                     setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu")
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchData()

        return () => { mounted = false }
    }, [slug])

    return { detail, episodes, loading, error }
}
