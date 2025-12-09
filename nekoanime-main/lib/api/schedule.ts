import { get } from "@/lib/logic/http"
import { parserDom, getInfoTPost, type AnimeItem } from "./parser"
import dayjs from "dayjs"
import "dayjs/locale/vi"

dayjs.locale("vi")

export interface ScheduleItem {
    day: string
    date: string
    month: string
    items: AnimeItem[]
}

export async function getSchedule(): Promise<ScheduleItem[]> {
    const { data: html } = await get("/lich-chieu-phim.html")
    const $ = parserDom(html)
    const now = Date.now()

    return $("#sched-content > .Homeschedule")
    .map((_i, item) => {
      const $item = $(item)
      const day = $item.find(".Top > h1 > b").text().trim()
      const dateText = $item.find(".Top > h1").text().trim()
      const dateParts = dateText.split(",")?.[1]?.trim().split(" ")
      const date = dateParts?.[1] || ""
      const month = dateParts?.[3] || ""

      const items = $item.find(".MovieList .TPostMv")
        .map((_j, subItem) => getInfoTPost($(subItem)))
        .toArray() as unknown as AnimeItem[]

      if (items.length === 0) return null
      
      return { day, date, month, items }
    })
    .toArray()
    .filter(Boolean) as unknown as ScheduleItem[]
}
