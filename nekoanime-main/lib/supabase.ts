import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Ensure environment variables are checked to avoid runtime errors in dev if missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Check .env.local")
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")
