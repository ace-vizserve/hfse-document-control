import { createAuthClient } from "../lib/supabase-auth";

export type CurrentUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // `next dev` only: lets local testing act as a user without Microsoft.
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

  // This Supabase project is shared with apps that use email + password, and one person's
  // accounts can be linked. Require a Microsoft account and a session started through it.
  if (!user?.email || !user.app_metadata?.providers?.includes("azure")) return null;
  const { data } = await supabase.auth.getClaims();
  const signedInWithOAuth = data?.claims.amr?.some(
    (entry) => (typeof entry === "string" ? entry : entry.method) === "oauth",
  );
  if (!signedInWithOAuth) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return { userId: user.id, displayName: fullName ?? user.email, email: user.email, fullName };
}
