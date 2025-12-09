
import { load } from "cheerio"
import fs from "fs"

async function debug() {
    try {
        const url = "https://animevietsub.show/phim/sozai-saishuka-no-isekai-ryokouki-a5742/xem-phim.html"
        console.log("Fetching:", url)

        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
                "Referer": "https://animevietsub.show/",
            }
        })

        const html = await res.text()
        console.log("Status:", res.status)
        console.log("Length:", html.length)

        fs.writeFileSync("source_dump.html", html)
        console.log("Saved to source_dump.html")

        const $ = load(html)
        console.log("Episodes found via #list-server:", $("#list-server .list-episode .episode").length)
        console.log("Episodes found via .list-episode:", $(".list-episode a").length)

    } catch (e) {
        console.error(e)
    }
}

debug()
