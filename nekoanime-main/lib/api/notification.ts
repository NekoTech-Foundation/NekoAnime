import { get } from "@/lib/logic/http"
import * as cheerio from "cheerio"

export interface NotificationItem {
    id: string
    title: string
    content: string
    time: string
    link: string
    isRead: boolean
}

export async function getNotifications(cookie: string) {
    // animevietsub logic: /ajax/notification?notif=true
    const { data: json } = await get("/ajax/notification?notif=true", {
        cookie
    })

    try {
        const data = JSON.parse(json)
        if (data.html && data.html !== "Not login") {
             // Parse HTML
             const $ = cheerio.load(data.html)
             const items: NotificationItem[] = []
             $("li").each((i, el) => {
                 const $el = $(el)
                 const $a = $el.find("a")
                 const link = $a.attr("href") || ""
                 const title = $a.find("span.bold").text().trim()
                 // Content structure might vary, assume simple text or parse more
                 const content = $a.text().replace(title, "").trim()
                 
                 items.push({
                     id: `notify-${i}`, // No ID in HTML usually unless data attr
                     title,
                     content,
                     link,
                     time: "", // Extract if available
                     isRead: false
                 })
             })
             return { items, total: parseInt(data.total || "0") }
        }
    } catch (e) {
        console.error("Parse notification error", e)
    }
    return { items: [], total: 0 }
}
