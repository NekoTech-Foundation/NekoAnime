import { create } from 'zustand'
import { queryHistory, HistoryItem, fetchLegacyHistory, syncLegacyToSupabase } from '@/lib/api/history'
import { useAuthStore } from './useAuthStore'

interface HistoryState {
  items: HistoryItem[]
  loading: boolean
  hasMore: boolean
  page: number
  error: string | null

  loadMore: () => Promise<void> // keeping for backup or remove? Better remove or alias
  fetchPage: (page: number) => Promise<void>
  refresh: () => Promise<void>
  sync: (page?: number) => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  loading: false,
  hasMore: true,
  page: 1,
  error: null,

  fetchPage: async (page: number) => {
    set({ loading: true, error: null })
    const uid = useAuthStore.getState().uid()
    console.log("[HistoryStore] fetchPage called for:", { uid, page })
    
    if (!uid) {
        set({ loading: false, error: "Not logged in" })
        return
    }

    try {
        let newItems = await queryHistory(uid, page)
        console.log("[HistoryStore] Initial query result:", newItems.length)
        
        // Lazy Sync: If no items found in DB, try fetching from legacy site for this page
        if (newItems.length === 0) {
            console.log(`Page ${page} empty in DB, attempting legacy sync...`)
            await get().sync(page)
            // Retry query after sync
            newItems = await queryHistory(uid, page)
            console.log("[HistoryStore] Post-sync query result:", newItems.length)
        }

        set({ items: newItems, page: page, hasMore: newItems.length === 30 })
    } catch (err) {
        console.error("[HistoryStore] fetchPage error:", err)
        set({ error: "Failed to load history" })
    } finally {
        set({ loading: false })
    }
  },

  refresh: async () => {
    // Trigger sync for page 1 on refresh
    try {
       await get().sync(1)
    } catch(e) { console.error("Sync failed", e)}
    
    // Then load page 1
    await get().fetchPage(1)
  },

  sync: async (page: number = 1) => {
      const uid = useAuthStore.getState().uid()
      if (!uid) return
      
      try {
          const legacyItems = await fetchLegacyHistory(page)
          if (legacyItems.length > 0) {
              await syncLegacyToSupabase(uid, legacyItems)
          }
      } catch (e) {
          console.error("Sync error", e)
      }
  }
}))
