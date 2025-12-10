
import { get } from "../logic/http"
import { parseFollowedList, type FollowedList } from "../parser/follow"

export async function getFollowedList(page: number, tokenName: string, tokenValue: string): Promise<FollowedList> {
    if (!tokenName || !tokenValue) throw new Error("Require login")

    const { data: html } = await get(`/tu-phim/trang-${page}.html`, {
        cookie: `${tokenName}=${tokenValue}`
    })
    
    return parseFollowedList(html)
}

export async function toggleFollow(id: string, value: boolean, tokenName: string, tokenValue: string): Promise<boolean> {
     if (!tokenName || !tokenValue) throw new Error("Require login")
     
     const type = value ? "add" : "remove"
     const { data } = await get(`/ajax/notification?Bookmark=true&filmId=${id}&type=${type}`, {
         cookie: `${tokenName}=${tokenValue}`
     })
     
     // API returns "1" for success usually, or status code.
     // Reference AjaxLike returns parseInt(data)
     return parseInt(data) === 1
}

export async function checkFollowStatus(id: string, tokenName: string, tokenValue: string): Promise<boolean> {
    if (!tokenName || !tokenValue) return false

    try {
        const { data } = await get(`/ajax/notification?Bookmark=true&filmId=${id}`, {
            cookie: `${tokenName}=${tokenValue}`
        })
        const json = JSON.parse(data)
        return json.status === 1
    } catch (e) {
        console.error("Check follow status failed", e)
        return false
    }
}
