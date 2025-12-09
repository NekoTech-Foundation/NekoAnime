
import { useState, useEffect } from "react"
import { httpGet } from "@/lib/logic/http"
import { parseHome, type AnimeItem, type ScheduleItem } from "@/lib/api/parser"

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
        const response = await httpGet("/")
        // The scraping logic expects the full HTML of the homepage
        // Note: C_URL + "/"

        if (typeof response.data !== "string") {
            throw new Error("Invalid response format")
        }

        const parsed = parseHome(response.data)
        setData(parsed)
      } catch (err: unknown) {
        console.error(err)
        setError("Failed to load data. Ensure Extension is active.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
