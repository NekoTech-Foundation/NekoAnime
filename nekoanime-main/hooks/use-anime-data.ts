
import { useState, useEffect } from "react"
import { animapperClient, type AniMapperAnimeData, type AniMapperEpisode } from "@/lib/animapper-client"
import type { AnimeDetail } from "@/lib/api/parser/detail"
import type { Episode } from "@/lib/api/parser/episode"

function mapDetail(d: AniMapperAnimeData, slug: string): AnimeDetail {
    return {
        id: d.id,
        name: d.title,
        othername: d.altTitles[0] || "",
        image: d.banner || d.poster || "",
        poster: d.poster,
        description: d.description || "",
        rate: d.rate || 0,
        count_rate: 0,
        views: d.views || 0,
        status: d.status,
        genres: d.genres.map(g => ({name: g, href: "#"})),
        studio: d.studio,
        yearOf: d.yearRelease,
        countries: [{name: d.countryOfOrigin, href: "#"}],
        pathToView: `/phim/${slug}`,
        watchUrl: `/phim/${slug}`,
        duration: "",
        follows: 0,
        quality: "HD",
        language: "Vietsub",
        authors: [],
        seasonOf: null,
        related: []
    }
}

function mapEpisodes(eps: AniMapperEpisode[]): Episode[] {
    return eps.map(e => ({
        id: e.episodeId, // Keep full ID for backend
        name: `Tập ${e.episodeNumber}`,
        play: e.play || "",
        hash: e.hash || "",
        href: "#"
    }))
}

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
                // Fetch Details first to get the ID
                const aniDetail = await animapperClient.getAnimeDetails(slug)
                const eps = await animapperClient.getEpisodes(aniDetail.id) // Use ID from detail

                if (mounted) {
                    setDetail(mapDetail(aniDetail, slug))
                    setEpisodes(mapEpisodes(eps))
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
