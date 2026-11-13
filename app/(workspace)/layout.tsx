import type { ReactNode } from "react";
import { access } from "../access";
import AccessNotice from "../AccessNotice";
import DashboardShell from "./_shell/DashboardShell";
import { toShellUser } from "./_shell/shell-user";
import { loadSubmittedRequestCount } from "./dashboard/data";

/**
 * Shared frame for every signed-in workspace page (dashboard, Document Control, RCA, meetings, library).
 * A layout is not re-rendered on navigation, so the sidebar stays mounted and only the page area changes.
 * Each page still checks its own access; this only decides whether to show the frame at all.
 */
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { user, canControl } = await access();
  if (!user) {
    return <AccessNotice kind="signin" title="Sign-in required" message="Sign in with your HFSE Microsoft account or your email and password on the home page." />;
  }
  const requestCount = canControl ? await loadSubmittedRequestCount().catch(() => 0) : 0;
  return (
    <DashboardShell user={toShellUser(user)} requestCount={requestCount} admin={canControl}>
      {children}
    </DashboardShell>
  );
}
