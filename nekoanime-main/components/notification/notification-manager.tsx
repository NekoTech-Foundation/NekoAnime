"use client"

import { useNotificationStore } from "@/hooks/useNotificationStore"
import { useEffect } from "react"
import { useAuthStore } from "@/hooks/useAuthStore"

export function NotificationManager() {
    const { startPolling, stopPolling } = useNotificationStore()
    const isLogged = useAuthStore((state) => state.isLogged())

    useEffect(() => {
        if (isLogged) {
            // Request permission
            if (typeof Notification !== 'undefined' && Notification.permission === "default") {
                Notification.requestPermission()
            }
            startPolling()
        } else {
            stopPolling()
        }
        return () => stopPolling()
    }, [isLogged, startPolling, stopPolling])

    return null
}
