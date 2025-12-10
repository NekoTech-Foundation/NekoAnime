import { supabase } from "@/lib/supabase"
import dayjs from "dayjs"

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
  // Add other fields from RPC response
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
        p_poster: info.poster, // Helper to remove host url if needed? Reference does removeHostUrlImage
        season_id: season, // Reference uses getRealSeasonId(season)
        p_season_name: info.season_name,
        e_cur: watchProgress.cur,
        e_dur: watchProgress.dur,
        e_name: watchProgress.name,
        e_chap: episode,
        gmt: 7 // Fixed GMT/Timezone? Reference uses calculated client GMT.
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
