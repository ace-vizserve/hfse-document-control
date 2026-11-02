import { NextResponse } from "next/server";
import { createAuthClient } from "../../../lib/supabase-auth";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: { scopes: "email", redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) return NextResponse.redirect(`${origin}/?auth_error=1`);
  return NextResponse.redirect(data.url);
}
