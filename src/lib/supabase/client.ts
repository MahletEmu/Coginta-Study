import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    !url.includes("your-project") &&
    !anonKey.includes("your-anon-key") &&
    url.startsWith("https://")
  );
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return clientInstance;
}
