import { NextResponse } from "next/server";
import { createAuthClient } from "../../../lib/supabase-auth";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email === "string" && typeof password === "string" && email && password) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return NextResponse.redirect(`${origin}/`, { status: 303 });
  }
  return NextResponse.redirect(`${origin}/?auth_error=1`, { status: 303 });
}

// Microsoft sign-in. Nothing links here until the Azure app's redirect URL is fixed.
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
