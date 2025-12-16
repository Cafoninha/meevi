import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (clientInstance) return clientInstance

  clientInstance = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Disabled to prevent automatic fetch calls
        detectSessionInUrl: false, // Disabled to prevent automatic auth checks
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    },
  )

  return clientInstance
}

export function createBrowserClient() {
  return createClient()
}
