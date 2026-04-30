"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error?: string;
};

export async function signInWithPassword(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase ainda não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = getSafeNextPath(String(formData.get("next") || ""));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signInWithGoogle(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/entrar?error=supabase-not-configured");
  }

  const next = getSafeNextPath(String(formData.get("next") || ""));
  const siteUrl = await getActionSiteUrl();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/entrar?error=google-sign-in-failed");
  }

  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/entrar");
}

function getSafeNextPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

async function getActionSiteUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return getSiteUrl();
}
