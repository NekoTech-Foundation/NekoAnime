import { animapperClient } from "@/lib/animapper-client"
import { getProxiedImageUrl } from "@/lib/utils"

export interface RankingItem {
    name: string
    image: string
    path: string
    othername: string
    process: string
    chap: string
    views: number
    rate: number
}

export async function getRanking(type: string = ""): Promise<RankingItem[]> {
    // Default limit 20 as per requested logic in UI
    const data = await animapperClient.getLeaderboard(type, 20)
    
    return data.map(item => ({
        name: item.title,
        image: getProxiedImageUrl(item.poster),
        path: `/phim/${item.id}`,
        othername: "", // Backend doesn't always return this in leaderboard list
        process: item.rate ? `${item.rate} ⭐` : "???",
        chap: item.episodesReleased?.toString() || "?",
        views: item.views || 0,
        rate: item.rate || 0
    }))
}
