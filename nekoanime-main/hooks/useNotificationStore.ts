import { create } from 'zustand'
import { getNotifications, NotificationItem } from '@/lib/api/notification'
import { useAuthStore } from './useAuthStore'

interface NotificationState {
  items: NotificationItem[]
  unreadCount: number
  loading: boolean
  
  fetch: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

let pollingInterval: NodeJS.Timeout | null = null

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    const { tokenName, tokenValue } = useAuthStore.getState()
    if (!tokenName || !tokenValue) return

    try {
        set({ loading: true })
        const cookie = `${tokenName}=${tokenValue}`
        const { items, total } = await getNotifications(cookie)
        
        // Simple logic: if items > prev items and browser notification supported -> notify
        // For now just update state
        const prevItems = get().items
        if (items.length > prevItems.length && prevItems.length > 0) {
            // New notification logic here (UI side or here)
            if (Notification.permission === "granted") {
                new Notification("NekoAnime", { body: "Có thông báo mới từ AnimeVietsub!" })
            }
        }

        set({ items, unreadCount: total })
    } catch (e) {
        console.error(e)
    } finally {
        set({ loading: false })
    }
  },

  startPolling: () => {
    if (pollingInterval) return
    get().fetch()
    pollingInterval = setInterval(() => {
        get().fetch()
    }, 60000) // 1 minute
  },

  stopPolling: () => {
    if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
    }
  }
}))
