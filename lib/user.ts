import { supabaseBrowser } from "./supabaseClient"

const LOCAL_STORAGE_KEY = "rhymemind-user-id"

export async function getOrCreateUserId(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  if (existing) return existing

  // For now we create an anonymous profile row and use its id.
  const email = `anon-${crypto.randomUUID()}@rhymemind.local`

  const { data, error } = await supabaseBrowser
    .from("profiles")
    .insert({
      email,
      credits: 10,
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("Failed to create anonymous profile", error)
    return null
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, data.id)
  return data.id
}

