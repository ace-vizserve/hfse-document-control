# HFSE Document Control

Next.js app hosted on Vercel, with Supabase for the database and attachment storage.

## Local setup

1. Run `pnpm install`.
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_KEY`.
3. Apply `supabase/migrations` to your Supabase project.
4. Run `pnpm dev`.

Until Microsoft login is added, deployed sites refuse every sign-in. For local development only, set `LOCAL_DEV_USER_EMAIL` in `.env.local` to act as that user.

Run `pnpm test` for the domain tests.
