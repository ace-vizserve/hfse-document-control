// Placeholder until Microsoft login replaces this file.
// The old platform's identity headers can be faked on Vercel, so they are no longer read.
// Deployed sites treat everyone as signed out; only `next dev` can act as a local test user.
export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const email =
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_DEV_USER_EMAIL
      : undefined;
  if (!email) return null;
  return { userId: "local-dev", displayName: email, email, fullName: null };
}
