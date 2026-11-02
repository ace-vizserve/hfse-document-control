import { NextResponse } from "next/server";
import { createAuthClient } from "../../../lib/supabase-auth";

export async function POST(request: Request) {
  const supabase = await createAuthClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(`${new URL(request.url).origin}/`, { status: 303 });
}
