
import { create } from 'zustand'
import { getFollowedList, toggleFollow, checkFollowStatus } from '@/lib/api/follow'
import { useAuthStore } from './useAuthStore'
import { AnimeItem } from '@/lib/api/parser/helpers'

interface FollowState {
    items: AnimeItem[]
    curPage: number
    maxPage: number
    loading: boolean
    
    // Status cache for individual items (to show heart state quickly)
    // Map<animeId, isFollowed>
    statusCache: Record<string, boolean>

    fetchList: (page?: number) => Promise<void>
    loadMore: () => Promise<void>
    
    toggle: (id: string, currentStatus: boolean) => Promise<boolean>
    checkStatus: (id: string) => Promise<void>
}

export const useFollowStore = create<FollowState>((set, get) => ({
    items: [],
    curPage: 1,
    maxPage: 1,
    loading: false,
    statusCache: {},

    fetchList: async (page = 1) => {
        const { tokenName, tokenValue } = useAuthStore.getState()
        if (!tokenName || !tokenValue) return
        
        set({ loading: true })
        try {
            const data = await getFollowedList(page, tokenName, tokenValue)
            set({ 
                items: data.items,
                curPage: data.curPage,
                maxPage: data.maxPage,
                loading: false 
            })
        } catch (e) {
            console.error("Fetch followed list failed", e)
            set({ loading: false })
        }
    },

    loadMore: async () => {
        const { curPage, maxPage, loading } = get()
        if (loading || curPage >= maxPage) return
        await get().fetchList(curPage + 1)
    },

    toggle: async (id: string, currentStatus: boolean) => {
        const { tokenName, tokenValue } = useAuthStore.getState()
        if (!tokenName || !tokenValue) return false
        
        // Optimistic update
        const newStatus = !currentStatus
        set(state => ({
            statusCache: { ...state.statusCache, [id]: newStatus }
        }))

        try {
            const success = await toggleFollow(id, newStatus, tokenName, tokenValue)
            if (!success) {
                // Revert
                 set(state => ({
                    statusCache: { ...state.statusCache, [id]: currentStatus }
                }))
                return currentStatus
            }
            return newStatus
        } catch (e) {
            console.error("Toggle follow failed", e)
             // Revert
             set(state => ({
                statusCache: { ...state.statusCache, [id]: currentStatus }
            }))
            return currentStatus
        }
    },

    checkStatus: async (id: string) => {
         const { tokenName, tokenValue } = useAuthStore.getState()
         if (!tokenName || !tokenValue) return
         
         try {
             const isFollowed = await checkFollowStatus(id, tokenName, tokenValue)
             set(state => ({
                 statusCache: { ...state.statusCache, [id]: isFollowed }
             }))
         } catch (e) {
             console.error("Check status failed", e)
         }
    }
}))
