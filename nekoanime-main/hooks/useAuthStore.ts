import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import sha256 from 'sha256'
import { login as apiLogin, getUser as apiGetUser } from '@/lib/api/auth'
import { AccountInfo } from '@/lib/parser/account'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: AccountInfo | null
  tokenName: string | null
  tokenValue: string | null
  
  // Computed (derived in logic, but stored in state for simplicity or getters)
  isLogged: () => boolean
  uid: () => string | null

  login: (email: string, pass: string) => Promise<void>
  logout: () => void
  restore: () => Promise<void>
  setTokenByCookie: (cookieStr: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokenName: null,
      tokenValue: null,

      isLogged: () => !!get().tokenName && !!get().tokenValue && !!get().user,
      uid: () => {
        const user = get().user
        if (!user) return null
        return sha256(user.email + user.name)
      },

      login: async (email, password) => {
        const data = await apiLogin(email, password)
        set({ user: data })
        get().setTokenByCookie(data.cookie)
        
        // Sync to Supabase logic from reference
        const uid = get().uid()
        if (uid && data) {
           await supabase.rpc("upsert_user", {
              p_uuid: uid,
              p_email: data.email,
              p_name: data.name
           })
        }
      },

      logout: () => {
        set({ user: null, tokenName: null, tokenValue: null })
        Cookies.remove('token_name')
        Cookies.remove('token_value')
        Cookies.remove('user_data')
      },

      restore: async () => {
        const { tokenName, tokenValue, setTokenByCookie } = get()
        // If state has tokens (rehydrated), verify them
        if (tokenName && tokenValue) {
            try {
                const cookieStr = `${tokenName}=${tokenValue}`
                const data = await apiGetUser(cookieStr)
                set({ user: data })
                setTokenByCookie(data.cookie)
            } catch (e) {
                console.error("Restore user failed", e)
                get().logout()
            }
        }
      },

      setTokenByCookie: (cookieStr: string) => {
        console.log("[AuthStore] setTokenByCookie called with:", cookieStr)
        if (!cookieStr) {
             console.warn("[AuthStore] No cookie string provided")
             return
        }

        const parts = cookieStr.split(';').map(p => p.trim())
        let tName = ''
        let tValue = ''

        const regex = /(token\w+)=([^;]+)/g
        let match
        while ((match = regex.exec(cookieStr)) !== null) {
            const [full, name, value] = match
            console.log("[AuthStore] Found match:", { name, value })
            if (name === 'token_name') tName = value
            if (name === 'token_value') tValue = value
            
            if (name.startsWith('token') && name !== 'token_name' && name !== 'token_value') {
                 tName = name
                 tValue = value
            }
        }
        
        console.log("[AuthStore] Final tokens:", { tName, tValue })

        if (tName && tValue) {
            set({ tokenName: tName, tokenValue: tValue })
            Cookies.set('token_name', tName, { expires: 30 })
            Cookies.set('token_value', tValue, { expires: 30 })
            console.log("[AuthStore] Tokens saved to state and cookies")
        } else {
            console.warn("[AuthStore] Failed to parse tokens from cookie string")
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
          user: state.user, 
          tokenName: state.tokenName, 
          tokenValue: state.tokenValue 
      }) as any
    }
  )
)
