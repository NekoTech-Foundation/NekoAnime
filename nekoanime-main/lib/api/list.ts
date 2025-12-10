import { get } from "../logic/http"
import { parserDom } from "./parser"
import { AnimeItem } from "./parser/index"

export interface ListResult {
    items: AnimeItem[]
    maxPage: number
    curPage: number
}

// Map local filter keys to upstream path segments if needed
// Or simply use query params if the upstream supports them.
// Looking at desktop-web-main logic:
// It constructs URLs like: `/${type_normal}/${value}/trang-${page}.html`
// e.g. `/danh-sach/phim-moi/trang-1.html`
// or `/the-loai/hanh-dong/trang-1.html`
// Multi-filtering might be complex (cookies or query params). 
// The source uses `TypeNormalValue` which seems to handle simple one-parameter paths mostly?
// But lines 250-256 in `[_type-normal]/[value].vue` pass `genres`, `seaser`, etc. to `TypeNormalValue`.
// Let's assume for now we use the basic `/danh-sach/phim-moi` or `/the-loai/...` 
// But the user wants a COMBINED filter page "danh-sach" where they can pick genre like "src chính".
// The "src chính" /danh-sach page likely allows filtering by params.
// I'll try to implement a generic fetcher that accepts a path or params.

export async function getList(
    path: string = "/danh-sach/phim-moi", 
    page: number = 1,
    filters?: Record<string, string>
): Promise<ListResult> {
    // Construct URL
    // Upstream usually supports: `https://animevietsub.show/danh-sach/phim-moi/trang-1.html?genre=...&year=...` ?
    // I will try to follow the simple pattern: Base Path + Page + Query Params.
    
    // Normalize path to not have trailing slash
    let url = path.replace(/\/$/, "")
    
    // Clean path of existing page param if present (basic)
    url = url.replace(/\/trang-\d+(\.html)?$/, "")

    // Appending page
    url = `${url}/trang-${page}.html`

    // Append query params if any
    if (filters) {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.append(key, val)
        })
        const qs = params.toString()
        if (qs) url += `?${qs}`
    }

    const { data: html } = await get(url)
    const $ = parserDom(html)

    const items: AnimeItem[] = []
    
    // Parse Items (using same selectors as Search/Schedule)
    $(".TPostMv").each((_, el) => {
        const $el = $(el)
        const image = $el.find("img").attr("src") || ""
        const name = $el.find(".Title").text().trim()
        const othername = $el.find(".Title").next().text().trim() // Often the subtitle? Or check specific class
        const path = $el.find("a").attr("href") || ""
        
        // Extract ID/Slug from path
        // path usually: /phim/slug-a123/
        const match = path.match(/\/phim\/([^\/]+)/)
        const slug = match ? match[1] : ""

        // Process/Episodes
        const process = $el.find(".CPos a").text().trim() || $el.find(".CPos").text().trim()

        if (name && slug) {
            items.push({
                image,
                name,
                othername, // Might need better selector if available
                path: `/phim/${slug}`,
                process,
                description: "",
                chap: process,
                rate: 10,
                views: 0
            })
        }
    })

    // Parse Pagination
    let maxPage = 1
    const paginationLinks = $(".pagination li a")
    if (paginationLinks.length > 0) {
        paginationLinks.each((_, el) => {
             const href = $(el).attr("href")
             if (!href) return
             const m = href.match(/trang-(\d+)\.html/)
             if (m) {
                 const p = parseInt(m[1])
                 if (p > maxPage) maxPage = p
             }
        })
    }

    // Attempt to parse 'curPage' if possible, or trust input
    return {
        items,
        maxPage,
        curPage: page
    }
}
