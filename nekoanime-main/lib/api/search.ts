import { get } from "@/lib/logic/http"
import { parserDom, getInfoTPost, type AnimeItem } from "./parser"

export interface SearchResult {
    items: AnimeItem[]
    curPage: number
    maxPage: number
    title?: string
}

export async function getSearch(keyword: string, page: number = 1): Promise<SearchResult> {
    const url = `/tim-kiem/${keyword}/trang-${page}.html`
    const { data: html } = await get(url)
    const $ = parserDom(html)
    const now = Date.now()

    const items = $(".MovieList:eq(0)")
        .find(".TPostMv")
        .map((_i, item) => getInfoTPost($(item), now))
        .toArray() as unknown as AnimeItem[]

    const curPage = parseInt(
        $(".current").attr("data") ?? $(".current").attr("title") ?? "1"
    )
    const maxPage = parseInt(
        $(".larger:last-child, .wp-pagenavi > *:last-child").attr("data") ??
        $(".larger:last-child, .wp-pagenavi > *:last-child").attr("title") ??
        "1"
    )

    // Quick title extraction if needed
    const title = $(".breadcrumb:eq(0) > li")
        .slice(1)
        .map((_i, item) => $(item).text().trim())
        .toArray()
        .join(" ")
        .replace(/:/g, "")
        .replace(/^Danh sách /i, "")

    return { items, curPage, maxPage, title }
}
