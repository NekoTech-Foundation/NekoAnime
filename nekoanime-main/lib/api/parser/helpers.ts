
import { load, type Cheerio } from "cheerio"
import type { Element } from "domhandler"
import { parseDocument } from "htmlparser2"

export function parserDom(html: string) {
  return load(parseDocument(html))
}

export function getInfoAnchor(cheerio: Cheerio<Element>) {
    const href = cheerio.attr("href") || ""
    return {
        name: cheerio.text().trim(),
        href: getPathName(href)
    }
}

export function getPathName(url: string) {
    try {
        if (!url) return ""
        if (url.startsWith("http")) {
            return new URL(url).pathname
        }
        return url
    } catch {
        return url
    }
}

export function int(str: string | undefined) {
    if (!str) return 0
    const num = parseInt(str.replace(/,/g, ""))
    return isNaN(num) ? 0 : num
}

export interface AnimeItem {
    path: string
    image: string
    name: string
    chap: string
    rate: number
    views: number
    description?: string
}

export interface ScheduleItem {
    day: string
    date: string
    month: string
    items: AnimeItem[]
}

export interface RankingItem extends AnimeItem {
    top: number
}

export function getInfoTPost(cheerio: Cheerio<Element>): AnimeItem {
  const href = cheerio.find("a").attr("href")
  const path = href ? getPathName(href) : ""

  // Use data-src or src
  const image = cheerio.find(".Image img").attr("data-src") || cheerio.find("img").attr("src") || ""

  const name = cheerio.find(".Title").first().text().trim()

  const _chap = cheerio.find(".mli-eps").first().text().trim()
  const chap = _chap === "TẤT" ? "Full_Season" : _chap

  // Try multiple selectors for rate
  const rateText = cheerio.find(".anime-avg-user-rating").first().text().trim() ||
                   cheerio.find(".AAIco-star").first().text().trim()
  const rate = parseFloat(rateText) || 0

  const viewsText = cheerio.find(".Year").first().text()
  const views = int(viewsText.match(/[\d,]+/)?.[0])

  // Description
  const description = cheerio.find(".Description").first().text().trim() || 
                      cheerio.find(".ToolTip").first().text().trim() ||
                      cheerio.attr("data-content") || undefined

  return {
    path,
    image,
    name,
    chap,
    rate,
    views,
    description
  }
}

