import { get } from "@/lib/logic/http"
import { parserDom, getInfoTPost, type AnimeItem } from "./parser"
import { getPathName } from "./parser/helpers"

export interface RankingItem extends AnimeItem {
    process: string
    othername: string
}

export async function getRanking(type: string = ""): Promise<RankingItem[]> {
    const url = `/bang-xep-hang/${type}`
    const { data: html } = await get(url)
    const $ = parserDom(html)
    
    // Check which selector matches based on the source logic
    // desktop-web-main uses: .bxh-movie-phimletv > .group
    
    return $(".bxh-movie-phimletv > .group")
    .map((_i, item) => {
      const $item = $(item)
      
      // Image
      const image = $item.find("img").attr("src") || 
                    $item.attr("style")?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || ""

      const path = getPathName($item.find("a").attr("href") || "")
      const name = $item.find("a").text().trim()
      const othername = $item.find(".txt-info").text().trim()
      
      // The ranking page uses slightly different class for 'process' (view/rate/etc)
      const process = $item.find(".score").text().trim()

      return { 
          path, 
          image, 
          name, 
          othername, 
          process,
          chap: "", // Not explicitly shown in this list style usually
          views: 0,
          rate: 0
      }
    })
    .toArray() as unknown as RankingItem[]
}
