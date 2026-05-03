import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const VALID_EMAIL_OTP_TYPES = new Set<EmailOtpType>(["invite", "recovery"]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteUrl = requestUrl.origin;
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const next = getSafeNextPath(requestUrl.searchParams.get("next") || "");
  const type = requestUrl.searchParams.get("type");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/entrar?error=supabase-not-configured", siteUrl),
    );
  }

  if (!tokenHash || !isValidEmailOtpType(type)) {
    return NextResponse.redirect(
      new URL("/entrar?error=first-access-link-invalid", siteUrl),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("Failed to confirm first-access Supabase link.", {
      message: error.message,
      name: error.name,
      status: error.status,
      type,
    });

    return NextResponse.redirect(
      new URL("/entrar?error=first-access-link-invalid", siteUrl),
    );
  }

  return NextResponse.redirect(new URL(next || "/primeiro-acesso", siteUrl));
}

function getSafeNextPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/primeiro-acesso";
  }

  return next;
}

function isValidEmailOtpType(type: string | null): type is EmailOtpType {
  return type !== null && VALID_EMAIL_OTP_TYPES.has(type as EmailOtpType);
}
