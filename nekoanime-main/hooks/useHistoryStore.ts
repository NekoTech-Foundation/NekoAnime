import { create } from 'zustand'
import { queryHistory, HistoryItem, fetchLegacyHistory, syncLegacyToSupabase } from '@/lib/api/history'
import { useAuthStore } from './useAuthStore'

interface HistoryState {
  items: HistoryItem[]
  loading: boolean
  hasMore: boolean
  page: number
  error: string | null

  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  sync: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  loading: false,
  hasMore: true,
  page: 1,
  error: null,

  loadMore: async () => {
    const { loading, hasMore, page, items } = get()
    if (loading || !hasMore) return

    set({ loading: true, error: null })
    
    // Get UID from auth store (non-reactive read usually fine in action)
    const uid = useAuthStore.getState().uid()
    if (!uid) {
        set({ loading: false, error: "Not logged in" })
        return
    }

    try {
        // Sync on first load if empty? Or just fetch.
        // Let's rely on manual sync or background sync.
        // But user issue is missing history.
        // Let's Try to sync if page 1 and empty items?
        // Or just query.
        
        const newItems = await queryHistory(uid, page)
        
        if (newItems.length === 0) {
            set({ hasMore: false })
        } else {
            set({ items: [...items, ...newItems], page: page + 1 })
        }
    } catch (err) {
        console.error(err)
        set({ error: "Failed to load history" })
    } finally {
        set({ loading: false })
    }
  },

  refresh: async () => {
    set({ items: [], page: 1, hasMore: true })
    // Trigger sync on refresh
    try {
       await get().sync()
    } catch(e) { console.error("Sync failed", e)}
    await get().loadMore()
  },

  sync: async () => {
      const uid = useAuthStore.getState().uid()
      if (!uid) return
      
      try {
          const legacyItems = await fetchLegacyHistory()
          if (legacyItems.length > 0) {
              await syncLegacyToSupabase(uid, legacyItems)
          }
      } catch (e) {
          console.error("Sync error", e)
      }
  }
}))
