import { create } from 'zustand'
import { queryHistory, HistoryItem } from '@/lib/api/history'
import { useAuthStore } from './useAuthStore'

interface HistoryState {
  items: HistoryItem[]
  loading: boolean
  hasMore: boolean
  page: number
  error: string | null

  loadMore: () => Promise<void>
  refresh: () => Promise<void>
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
    await get().loadMore()
  }
}))
