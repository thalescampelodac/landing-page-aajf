import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/supabase/config";

export async function getRequestSiteUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host?.startsWith("localhost") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return getSiteUrl();
}
