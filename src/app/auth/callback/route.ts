import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteUrl = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const authErrorDescription = requestUrl.searchParams.get("error_description");
  const next = getSafeNextPath(requestUrl.searchParams.get("next") || "");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/entrar?error=supabase-not-configured", siteUrl),
    );
  }

  if (authError) {
    console.error("Supabase OAuth callback returned an error.", {
      authError,
      authErrorDescription,
    });

    return NextResponse.redirect(
      new URL("/entrar?error=google-sign-in-failed", siteUrl),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Failed to exchange Supabase OAuth code for session.", {
        message: error.message,
        name: error.name,
        status: error.status,
      });

      return NextResponse.redirect(
        new URL("/entrar?error=google-sign-in-failed", siteUrl),
      );
    }
  }

  return NextResponse.redirect(new URL(next, siteUrl));
}

function getSafeNextPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}
