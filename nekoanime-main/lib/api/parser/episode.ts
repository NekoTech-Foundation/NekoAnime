
import { parserDom } from "./helpers"

export interface Episode {
    id: string
    play: string
    hash: string
    name: string
}

export function parseEpisodeList(html: string) {
  const $ = parserDom(html)

  // Try multiple selectors
  let items = $("#list-server .list-episode .episode a")
  if (items.length === 0) {
     items = $(".list-episode a")
  }
  if (items.length === 0) {
     items = $(".list-server .episode a")
  }

  console.log("[Parser] Found episodes:", items.length)

  const episodes = items
    .map((_i, item) => {
      const $item = $(item)
      // Extract numeric ID only if needed, or keep full
      const id = $item.attr("data-id") || $item.attr("href")?.split("/").pop() || ""

      return {
        id: id,
        play: $item.attr("data-play") || "",
        hash: $item.attr("data-hash") || "",
        name: $item.text().trim()
      }
    })
    .toArray() as unknown as Episode[]

//   const [day, hour, minus] =
//     $(".schedule-title-main > h4 > strong:nth-child(3)")
//       .text()
//       .match(/(Thứ [^\s]+|chủ nhật) vào lúc (\d+) giờ (\d+) phút/i)
//       ?.slice(1) ?? []

  const updateTime = $(".schedule-title-main > h4 > strong:nth-child(3)").text().trim()

  return {
    episodes,
    updateTime,
    // Provide generic metadata if needed, though detail parser handles usually
    image: $(".Image img").attr("src") || "",
    poster: $(".TPostBg img").attr("src") || ""
  }
}
