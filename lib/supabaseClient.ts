import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // We intentionally don't throw in production build to avoid crashing the app,
  // but this helps catch misconfiguration during development.
  console.warn(
    "Supabase client is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

export const supabaseBrowser = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
)

