
import { parserDom, getInfoTPost, type AnimeItem } from "../api/parser/helpers"

export interface FollowedList {
    items: AnimeItem[]
    curPage: number
    maxPage: number
}

export function parseFollowedList(html: string): FollowedList {
    const $ = parserDom(html)
    
    // Logic adapted from TuPhim reference
    // Items are usually in a grid container. 
    // Reference uses GridCard :items="data.items" and TuPhim parser.
    // Let's assume standard .TPostMv structure is used.
    
    const items = $(".TPostMv")
        .map((_i, el) => getInfoTPost($(el)))
        .toArray() as unknown as AnimeItem[]
    
    // Pagination parsing
    // Usually .wp-pagenavi .current and .pages
    // Or we can parse from pagination links
    
    let curPage = 1
    let maxPage = 1
    
    const pagination = $(".wp-pagenavi")
    if (pagination.length) {
        const current = pagination.find(".current").text()
        curPage = parseInt(current) || 1
        
        // Find last page number
        const lastLink = pagination.find(".larger").last().text() || pagination.find(".page").last().text()
        const pagesText = pagination.find(".pages").text() // "Trang 1 của 6" or "Page 1 of 10"

        if (pagesText.includes("of")) {
             maxPage = parseInt(pagesText.split("of")[1].trim()) || 1
        } else if (pagesText.includes("của")) {
             // Handle Vietnamese "Trang X của Y"
             maxPage = parseInt(pagesText.split("của")[1].trim()) || 1
        } else if (lastLink && !isNaN(parseInt(lastLink))) {
             maxPage = parseInt(lastLink) || 1
        } else {
            // Fallback: try to find the max number in all page links
            const pageNumbers = pagination.find("a.page")
                .map((_, el) => parseInt($(el).text()))
                .toArray()
                .filter(n => !isNaN(n));
            
            if (pageNumbers.length > 0) {
                maxPage = Math.max(...pageNumbers);
            }
        }
        
        if (maxPage < curPage) maxPage = curPage
    }
    
    return { items, curPage, maxPage }
}
