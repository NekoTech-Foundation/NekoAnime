import { parserDom, getInfoTPost, AnimeItem } from "@/lib/api/parser/helpers"

export interface LegacyHistoryItem extends AnimeItem {
    season: string
    episode: string
    episode_name: string
    timestamp: string
}

export function parseLegacyHistory(html: string): LegacyHistoryItem[] {
  const $ = parserDom(html)
  const items: LegacyHistoryItem[] = []

  $(".TPostMv").each((_: number, el: any) => {
      const node = $(el)
      const item = getInfoTPost(node)
      
      // Extract specific history fields if available in DOM
      // Assuming TPostMv structure is similar to others but might have extra info
      
      // Example structure: href="/phim/a-b-123/tap-1-123.html"
      // we need to parse season and episode from URL or title
      
      const href = item.path
      const parts = href.split('/')
      // /phim/slug/tap-123.html
      
      let season = ""
      let episode = ""
      
      if (parts.length >= 3) {
          season = parts[2]
          const lastPart = parts[3]?.replace('.html', '') || ""
          episode = lastPart.split('-').pop() || "" // "3324" ID? 
          // Actually URL structure varies. 
          // Let's try to get "tap-1" from text if possible or just store what we have.
      }
      
      // Timestamp might be in a .Time node
      const time = node.find(".Time").text().trim()

      items.push({
          ...item,
          season,
          episode,
          episode_name: item.chap,
          timestamp: time
      })
  })

  return items
}
