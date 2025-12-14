import { useState, useEffect } from "react"
import { animapperClient, type AniMapperAnimeData } from "@/lib/animapper-client"
import { type AnimeItem, type ScheduleItem } from "@/lib/api/parser"

function mapHomeItem(d: AniMapperAnimeData): AnimeItem {
    return {
        name: d.title,
        image: d.poster || d.banner || "",
        path: `/phim/${d.id}`,
        views: d.views || 0,
        rate: d.rate || 0,
        chap: d.episodesReleased?.toString() || "?",
    }
}

export function useHomeData() {
  const [data, setData] = useState<{
    carousel: AnimeItem[]
    latestUpdate: AnimeItem[]
    nominate: AnimeItem[]
    thisSeason: AnimeItem[]
    schedule: ScheduleItem[]
    ranking: AnimeItem[]
    preRelease: AnimeItem[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const homeData = await animapperClient.getHome()
        
        setData({
             carousel: [], // Not supported yet
             latestUpdate: homeData.latestUpdate.map(mapHomeItem),
             nominate: homeData.nominate.map(mapHomeItem),
             thisSeason: [], // Not supported
             schedule: [], // Not supported
             ranking: homeData.ranking.map(mapHomeItem),
             preRelease: [] // Not supported
        })
      } catch (err: unknown) {
        console.error(err)
        setError("Failed to load home data via AniMapper.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
