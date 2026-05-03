import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AdminAccess =
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "denied"; email?: string }
  | { status: "authorized"; email?: string; profileId: string; role: string };

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!getSupabaseConfig()) {
    return { status: "unconfigured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data, error } = await supabase
    .schema("aajf")
    .from("admin_memberships")
    .select("role,status")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return { status: "denied", email: user.email };
  }

  return {
    email: user.email,
    profileId: user.id,
    role: data.role,
    status: "authorized",
  };
}
