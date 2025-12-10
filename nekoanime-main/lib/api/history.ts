import { supabase } from "@/lib/supabase"
import dayjs from "dayjs"
import { LegacyHistoryItem, parseLegacyHistory } from "@/lib/parser/history"
import { get } from "../logic/http"

// Types matching database/RPC
export interface HistoryItem {
  id: string
  name: string
  poster: string
  season: string
  season_name: string
  episode: string
  created_at: string
  timestamp?: dayjs.Dayjs
}

export async function queryHistory(userUid: string, page: number = 1, size: number = 30) {
  const { data, error } = await supabase.rpc("query_history", {
      p_user_id: userUid,
      p_page: page,
      p_size: size
  })

  if (error) throw error
  return data as HistoryItem[] || []
}

export async function setProgress(
    userUid: string, 
    season: string, 
    episode: string, 
    info: {
        name: string,
        poster: string,
        season_name: string
    },
    watchProgress: {
        cur: number,
        dur: number,
        name: string
    }
) {
    const { error } = await supabase.rpc("set_single_progress", {
        user_uid: userUid,
        p_name: info.name,
        p_poster: info.poster, 
        p_season_id: season, // Updated to match RPC
        p_season_name: info.season_name,
        e_cur: watchProgress.cur,
        e_dur: watchProgress.dur,
        e_name: watchProgress.name,
        e_chap: episode,
        gmt: 7
    })

    if (error) throw error
}

export async function getProgressChaps(userUid: string, season: string) {
    const { data, error } = await supabase.rpc("get_watch_progress", {
        user_uid: userUid,
        season_id: season
    })

    if (error) throw error
    return data
}

// ========== LEGACY SYNC ==========

export async function fetchLegacyHistory(page: number = 1) {
    // Legacy site history is at /lich-su usually, or we can assume page 1
    // The user screenshot showed /lich-su.
    // Pagination on legacy site? /lich-su/page/2 maybe? Or query param?
    // Let's assume just page 1 for now to get latest.
    const url = page === 1 ? "/lich-su" : `/lich-su/trang-${page}.html` // Guessing pagination pattern or /lich-su?page=2
    
    try {
        console.log("[HistoryAPI] Fetching legacy:", url)
        const { data: html } = await get(url)
        console.log("[HistoryAPI] HTML length:", html?.length)
        const parsed = parseLegacyHistory(html)
        console.log("[HistoryAPI] Parsed items:", parsed.length)
        return parsed
    } catch (e) {
        console.error("Failed to fetch legacy history", e)
        return []
    }
}

export async function syncLegacyToSupabase(userUid: string, items: LegacyHistoryItem[]) {
    // Loop and insert. Parallel or serial.
    // Use set_single_progress
    console.log(`Syncing ${items.length} items to Supabase for ${userUid}`)
    
    // We process in chunks to avoid overwhelming calls if many
    for (const item of items) {
        try {
            await setProgress(
                userUid,
                item.season,     // season_id
                item.episode,    // episode_id
                {
                    name: item.name,
                    poster: item.image,
                    season_name: item.name // often same or similar
                },
                {
                    cur: 0, // We don't have exact progress time from list, only "watched". Default 0 or full?
                    dur: 0,
                    name: item.episode_name
                }
            )
        } catch (e) {
            console.error(`Failed to sync item ${item.name}`, e)
        }
    }
}
