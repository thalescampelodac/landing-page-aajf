import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase browser client is not configured.");
  }

  return createBrowserClient(config.url, config.publishableKey);
}
