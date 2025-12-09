
import { parserDom, getInfoTPost, type AnimeItem } from "./helpers"
export type { AnimeItem } from "./helpers"
export { parserDom, getInfoTPost, getPathName } from "./helpers"

export interface ScheduleItem {
    day: string
    date: string
    month: string
    items: AnimeItem[]
}

export interface RankingItem extends AnimeItem {
    top: number
}


export function parseHome(html: string) {
  const $ = parserDom(html)

  // Map sections based on specific DOM classes from animevietsub
  const thisSeason = $(".MovieListTopCn").eq(0)
    .find(".TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray() as unknown as AnimeItem[]

  const carousel = $(".MovieListSldCn .TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray() as unknown as AnimeItem[]

  // Updated selectors based on common structure if IDs change, but keeping original IDs for now
  const latestUpdate = $("#single-home .TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray() as unknown as AnimeItem[]

  const nominate = $("#hot-home .TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray() as unknown as AnimeItem[]

  // Upcoming / Sắp chiếu #new-home
  const preRelease = $("#new-home .TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray() as unknown as AnimeItem[]

  // Schedule Parsing
  const schedule = $("#sched-content > .Homeschedule")
    .map((_i, item) => {
      const $item = $(item)
      const dateText = $item.find(".Top > h1").text().trim() // e.g., "Thứ Ba, Ngày 09 tháng 12"
      
      const day = $item.find(".Top > h1 > b").text().trim() // "Thứ Ba"
      const dateParts = dateText.split(",")?.[1]?.trim().split(" ")
      const date = dateParts?.[1] || "" // "09"
      const month = dateParts?.[3] || "" // "12"

      const items = $item.find(".MovieList .TPostMv")
        .map((_j, subItem) => getInfoTPost($(subItem)))
        .toArray() as unknown as AnimeItem[]

      if (items.length === 0) return null
      
      return { day, date, month, items }
    })
    .toArray()
    .filter(Boolean) as unknown as ScheduleItem[]

  // Ranking Parsing (Top Views)
  // Often in a sidebar #showTopPhim or similar
  const ranking = $("#showTopPhim .TPostMv, .Wdgt.Cn.Top .TPostMv")
    .map((_i, item) => {
       const info = getInfoTPost($(item))
       return { ...info, top: _i + 1 }
    })
    .toArray() as unknown as AnimeItem[]

  return {
    thisSeason,
    carousel,
    latestUpdate,
    nominate,
    schedule,
    ranking,
    preRelease
  }
}
