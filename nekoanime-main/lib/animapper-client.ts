import axios from "axios";

const ANIMAPPER_API_URL = process.env.NEXT_PUBLIC_ANIMAPPER_API || "http://localhost:8080/api/v1";

export interface AniMapperAnimeData {
    id: string
    title: string
    altTitles: string[]
    yearRelease: number
    characters: string[]
    genres: string[]
    episodesReleased: number
    studio?: string
    countryOfOrigin: string
    poster?: string
    banner?: string
    description?: string
    rate?: number
    views?: number
    status?: string
}

export interface AniMapperEpisode {
    episodeNumber: string
    episodeId: string // mediaId$epId
    play?: string
    hash?: string
}

export interface AniMapperSource {
   server: string
   type: string
   url: string
   corsProxyRequired: boolean
   proxyHeaders?: Record<string, string>
}

export const animapperClient = {
    async getAnimeDetails(id: string, provider = "ANIMEVIETSUB"): Promise<AniMapperAnimeData> {
        try {
            const res = await axios.get(`${ANIMAPPER_API_URL}/anime/details`, {
                params: { id, provider }
            });
            if (res.data.success) {
                return res.data.data;
            }
            throw new Error(res.data.message || "Failed to fetch details");
        } catch (error) {
            console.error("AniMapper Details Error", error);
            throw error;
        }
    },

    async getEpisodes(id: string, provider = "ANIMEVIETSUB"): Promise<AniMapperEpisode[]> {
        try {
            // AniMapper expects just the initial ID part if it caches?
            // Or the full ID?
            // In Scraper.getEpisodes, it calls `client.get("$baseUrl/phim/b-${mediaId}/xem-phim.html")`
            // `getIdFromUrl` returns `sozai-saishuka-no-isekai-ryokouki-a5742` -> `a5742`.
            // So we should probably pass the ID extracted from the slug if possible, or let the backend handle it.
            // But wait, the backend `scrapeAnimeData` returns ID like `a5742`.
            // So if we pass `a5742` to getEpisodes, it should work.
            
            // However, the frontend usually deals with slugs like `sozai-saishuka-no-isekai-ryokouki-a5742`.
            // We need to extract the ID from this slug before calling getEpisodes, OR ensure the backend handles the full slug.
            // AniMapper's AnimeVietSubScraper.getIdFromUrl extracts `a5742` from the URL.
            // `getEpisodes` uses `mediaId` in the URL directly: `/phim/b-${mediaId}/xem-phim.html`.
            // If we pass `a5742`, it becomes `/phim/b-a5742/xem-phim.html`. This looks correct for AnimeVietSub (often b-ID).
            
            // Let's retry extracting ID from slug in the client or assume the backend does it.
            // The backend endpoint `/episodes` takes `id`.
            // If I pass the full slug, `ProviderType...getEpisodes(id)` is called.
            // `AnimeVietSubScraper` uses `mediaId` directly in the URL construction.
            // So we MUST pass the short ID (e.g., `a5742`) if the backend expects it.
            // But `scrapeAnimeData` returns `id="a5742"`.
            // So if we first call `getAnimeDetails` with the slug, we get the `id`. We can use that `id` to call `getEpisodes`.
            
            const res = await axios.get(`${ANIMAPPER_API_URL}/episodes`, {
                params: { id, provider, limit: 1000, offset: 0 }
            });
             // Response from /episodes is the ProviderEpisodeListDTO directly, check SearchRoute.kt:122 call.respond(response)
             // It returns proper JSON.
            return res.data.episodes || [];
        } catch (error) {
            console.error("AniMapper Episodes Error", error);
            throw error;
        }
    },

    async getLeaderboard(type = "day", limit = 10): Promise<AniMapperAnimeData[]> {
        try {
            const res = await axios.get(`${ANIMAPPER_API_URL}/anime/leaderboard`, {
                params: { type, limit }
            });
            if (res.data.success) {
                return res.data.data;
            }
            return [];
        } catch (error) {
            console.error("AniMapper Leaderboard Error", error);
            return [];
        }
    },

    async getHome(provider = "ANIMEVIETSUB"): Promise<{
        latestUpdate: AniMapperAnimeData[]
        nominate: AniMapperAnimeData[]
        ranking: AniMapperAnimeData[]
    }> {
        try {
            const res = await axios.get(`${ANIMAPPER_API_URL}/anime/home`, {
                params: { provider }
            });
            if (res.data.success) {
                return res.data.data;
            }
            return { latestUpdate: [], nominate: [], ranking: [] };
        } catch (error) {
            console.error("AniMapper Home Error", error);
            return { latestUpdate: [], nominate: [], ranking: [] };
        }
    },

    async getStreamSource(episodeData: string, provider = "ANIMEVIETSUB"): Promise<AniMapperSource> {
        try {
            const res = await axios.get(`${ANIMAPPER_API_URL}/source`, {
                params: { episodeData, provider }
            });
            return res.data;
        } catch (error) {
             console.error("AniMapper Source Error", error);
             throw error;
        }
    }
}
