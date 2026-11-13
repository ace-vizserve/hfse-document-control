import type { ShellUser } from "./DashboardShell";

/** Display name and initials for the dashboard header, from the signed-in user. */
export function toShellUser(user: { email: string; fullName: string | null }): ShellUser {
  const local = user.email.split("@")[0];
  const fromEmail = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
  const name = user.fullName?.trim() || fromEmail || user.email;
  const words = name.split(/\s+/).filter(Boolean);
  const initials = ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : words[0]?.[1] ?? "")).toUpperCase();
  return { email: user.email, name, initials };
}
