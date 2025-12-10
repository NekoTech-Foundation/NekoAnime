
import { parserDom, getInfoTPost, getInfoAnchor, getPathName, int, type AnimeItem } from "./helpers"
import type { CheerioAPI, Cheerio } from "cheerio"
import type { Element } from "domhandler"

function findInfo($: CheerioAPI, infoList: Cheerio<Element>, q: string) {
  return $(
    infoList.toArray().find((item) => {
      return $(item).find("strong").text().toLowerCase().startsWith(q)
    })
  )
}

export interface AnimeDetail {
    name: string
    othername: string
    image: string
    poster: string | undefined
    pathToView: string | null
    description: string
    rate: number
    count_rate: number
    duration: string
    yearOf: number
    views: number
    status: string | undefined
    follows: number
    quality: string
    language: string | undefined
    studio: string | undefined
    genres: {name: string, href: string}[]
    authors: {name: string, href: string}[]
    countries: {name: string, href: string}[]
    seasonOf: {name: string, href: string} | null
    related: AnimeItem[]
    watchUrl: string | null
    id: string
}

export function parseAnimeDetail(html: string) {
  const $ = parserDom(html)

  // Extract ID
  // Common WordPress / AnimeVietsub patterns
  let id = ""
  const postIdAttr = $("article[id^='post-']").attr("id")
  if (postIdAttr) {
      id = postIdAttr.replace("post-", "")
  }
  
  // Fallback: Check for hidden input with name='id' or 'movie_id'
  if (!id) {
       id = $("input[name='movie_id']").val() as string || $("input[name='id']").val() as string || ""
  }
  
  // Fallback: data-id on some elements
  if (!id) {
      id = $(".TPost").attr("data-id") || ""
  }


  const name = $(".Title").eq(0).text()
  const othername = $(".SubTitle").eq(0).text()

  const image = $(".Image img").attr("src") || ""
  const poster = $(".TPostBg img").attr("src")
  const pathToViewRef = $(".watch_button_more").attr("href")
  const pathToView = pathToViewRef ? getPathName(pathToViewRef) : null

  const description = $(".Description").eq(0).text().trim()
  const rate = parseFloat($("#average_score").eq(0).text()) || 0
  const count_rate = parseInt($(".num-rating").eq(0).text()) || 0

  const duration = $(".AAIco-access_time").eq(0).text()
  const yearOf = parseInt($(".AAIco-date_range").eq(0).find("a").text()) || 0

  const viewsText = $(".AAIco-remove_red_eye").eq(0).text()
  const views = int(viewsText.match(/[\d,]+/)?.[0])

//   const season = $(".season_item > a")
//     .map((_i, item) => getInfoAnchor($(item)))
//     .toArray()

  const genres = $(".breadcrumb > li > a")
    .slice(1, -1)
    .map((_i, item) => getInfoAnchor($(item)))
    .toArray() as {name: string, href: string}[]

  const quality = $(".Qlty").eq(0).text()

  // ==== info ====
  const infoListLeft = $(".mvici-left > .InfoList > .AAIco-adjust")
  const infoListRight = $(".mvici-right > .InfoList > .AAIco-adjust")

  const status = findInfo($, infoListLeft, "trạng thái")
    .text()
    .split(":", 2)[1]
    ?.trim()

  const authors = findInfo($, infoListLeft, "đạo diễn")
    .find("a")
    .map((_i, item) => getInfoAnchor($(item)))
    .toArray() as {name: string, href: string}[]

  const countries = findInfo($, infoListLeft, "quốc gia")
    .find("a")
    .map((_i, item) => getInfoAnchor($(item)))
    .toArray() as {name: string, href: string}[]

  const followsText = findInfo($, infoListLeft, "số người theo dõi")
      .text()
      .split(":", 2)[1]
      ?.trim()
  const follows = int(followsText)

  const language = findInfo($, infoListRight, "ngôn ngữ")
    .text()
    .split(":", 2)[1]
    ?.trim()

  const studio = findInfo($, infoListRight, "studio")
    .text()
    .split(":", 2)[1]
    ?.trim()

  // Season Of
  const seasonOfEl = findInfo($, infoListRight, "season").find("a")
  const seasonOf = seasonOfEl.length ? getInfoAnchor(seasonOfEl) : null

  // const trailer = $("#Opt1 iframe").attr("src") // Skip parsing trailer for now

  const related = $(".MovieListRelated .TPostMv")
    .map((_i, item) => getInfoTPost($(item)))
    .toArray()

  return {
    id,
    name,
    othername,
    image,
    poster,
    pathToView,
    description,
    rate,
    count_rate,
    duration,
    yearOf,
    views,
    genres,
    quality,
    status,
    authors,
    countries,
    follows,
    language,
    studio,
    seasonOf,
    related,
    watchUrl: pathToView
  }
}
