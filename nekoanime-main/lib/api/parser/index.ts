
import { parserDom, getInfoTPost } from "./helpers"

export interface AnimeItem {
    path: string
    image: string
    name: string
    chap: string
    rate: number
    views: number
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

  return {
    thisSeason,
    carousel,
    latestUpdate,
    nominate
  }
}
