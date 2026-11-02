import { createAuthClient } from "../lib/supabase-auth";

export type CurrentUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // `next dev` only: lets local testing act as a user without signing in.
  const devEmail =
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_DEV_USER_EMAIL
      : undefined;
  if (devEmail) {
    return { userId: "local-dev", displayName: devEmail, email: devEmail, fullName: null };
  }

  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Access is decided by email address in app/access.ts, so the address must be confirmed.
  if (!user?.email || !user.email_confirmed_at) return null;
  const { data } = await supabase.auth.getClaims();
  const signedIn = data?.claims.amr?.some((entry) => {
    const method = typeof entry === "string" ? entry : entry.method;
    return method === "password" || method === "oauth";
  });
  if (!signedIn) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return { userId: user.id, displayName: fullName ?? user.email, email: user.email, fullName };
}
