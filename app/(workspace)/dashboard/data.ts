import "server-only";
import { selectAll, tables } from "../../../db";
import type { Rca } from "../../../lib/rca";
import type { Meeting } from "../../../lib/meetings";

/** Dates in this app are Singapore calendar dates stored as YYYY-MM-DD. */
const todaySg = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

function addDays(day: string, days: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function shortDate(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-SG", { day: "numeric", month: "short", timeZone: "UTC" });
}

function timeAgo(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
}

/** The register fields the dashboard reads (documents store more than this). */
type RegisterDocument = { title: string; code: string; owner?: string; status: string; review?: string };

export type AttentionItem = {
  kind: "Document review" | "RCA" | "Meeting action";
  title: string;
  detail: string;
  due: string;
  dueLabel: string;
  overdue: boolean;
  href: string;
};

export type RcaSummary = {
  id: string;
  code: string;
  title: string;
  status: Rca["status"];
  department: string;
  assignee: string;
  dueLabel: string;
  overdue: boolean;
  progress: number;
  actionsDone: number;
  actionsTotal: number;
};

export type ActivityEntry = { id: string; actor: string; action: string; title: string; code: string; when: string };

export type ChartPoint = { week: string; changes: number; approvals: number };

export type DashboardData = {
  documents: { approved: number; inReview: number; draft: number; archived: number };
  reviews: { overdue: number; next30: number };
  rca: { open: number; overdue: number; awaitingApproval: number };
  meetingActions: { open: number; overdue: number };
  requestsSubmitted: number;
  chart: ChartPoint[];
  attention: AttentionItem[];
  openRcas: RcaSummary[];
  activity: ActivityEntry[];
};

export async function loadDashboard(): Promise<DashboardData> {
  const [docRows, historyRows, rcaRows, meetingRows, requestRows] = await Promise.all([
    selectAll(tables.documents, "seq"),
    selectAll(tables.history, "at", false),
    selectAll(tables.rcaCases, "updated", false),
    selectAll(tables.meetingMinutes, "updated", false),
    selectAll(tables.documentRequests, "created", false),
  ]);

  const today = todaySg();
  const in30 = addDays(today, 30);
  const in14 = addDays(today, 14);
  const docs: RegisterDocument[] = docRows.map((r) => r.data);
  const rcas: Rca[] = rcaRows.map((r) => r.data);
  const meetings: Meeting[] = meetingRows.map((r) => r.data);

  const count = (status: string) => docs.filter((d) => d.status === status).length;
  const reviewable = docs.filter(
    (d): d is RegisterDocument & { review: string } => d.status === "Approved" && typeof d.review === "string" && d.review !== "",
  );

  const openRcaList = rcas.filter((r) => r.status !== "Closed");
  const meetingActions = meetings
    .filter((m) => m.status !== "Draft")
    .flatMap((m) => (m.actions ?? []).map((a) => ({ meeting: m, action: a })))
    .filter(({ action }) => action.status !== "Completed");

  // Things with a date that is past or coming up soon.
  const attention: AttentionItem[] = [
    ...reviewable
      .filter((d) => d.review <= in30)
      .map((d) => ({
        kind: "Document review" as const,
        title: d.title,
        detail: `${d.code}${d.owner ? ` · ${d.owner}` : ""}`,
        due: d.review,
        href: "/control",
      })),
    ...openRcaList
      .filter((r) => r.due && r.due <= in14)
      .map((r) => ({
        kind: "RCA" as const,
        title: r.title,
        detail: `${r.code ?? "RCA"} · ${r.assignee}`,
        due: r.due,
        href: "/rca",
      })),
    ...meetingActions
      .filter(({ action }) => action.due && action.due <= in14)
      .map(({ meeting, action }) => ({
        kind: "Meeting action" as const,
        title: action.description,
        detail: `${meeting.title} · ${action.owner}`,
        due: action.due,
        href: "/meetings",
      })),
  ]
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 6)
    .map((item) => ({ ...item, overdue: item.due < today, dueLabel: shortDate(item.due) }));

  const openRcas: RcaSummary[] = [...openRcaList]
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
    .slice(0, 4)
    .map((r) => {
      const total = r.actions?.length ?? 0;
      const done = r.actions?.filter((a) => a.status === "Completed").length ?? 0;
      return {
        id: r.id ?? r.title,
        code: r.code ?? "RCA",
        title: r.title,
        status: r.status,
        department: r.department,
        assignee: r.assignee,
        dueLabel: r.due ? shortDate(r.due) : "No due date",
        overdue: !!r.due && r.due < today,
        progress: total ? Math.round((done / total) * 100) : 0,
        actionsDone: done,
        actionsTotal: total,
      };
    });

  // Register activity per week for the last eight weeks (oldest first).
  const chart: ChartPoint[] = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(today, -7 * (8 - i) + 1);
    const end = addDays(start, 6);
    const inWeek = historyRows.filter((h) => {
      const day = new Date(h.at).toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
      return day >= start && day <= end;
    });
    return {
      week: shortDate(start),
      changes: inWeek.length,
      approvals: inWeek.filter((h) => h.action === "Approved").length,
    };
  });

  const now = Date.now();
  const activity: ActivityEntry[] = historyRows.slice(0, 8).map((h) => ({
    id: h.id,
    actor: h.actor,
    action: h.action,
    title: h.data?.title ?? "Untitled document",
    code: h.data?.code ?? "",
    when: timeAgo(h.at, now),
  }));

  return {
    documents: { approved: count("Approved"), inReview: count("In review"), draft: count("Draft"), archived: count("Archived") },
    reviews: {
      overdue: reviewable.filter((d) => d.review < today).length,
      next30: reviewable.filter((d) => d.review >= today && d.review <= in30).length,
    },
    rca: {
      open: openRcaList.length,
      overdue: openRcaList.filter((r) => r.due && r.due < today).length,
      awaitingApproval: openRcaList.filter((r) => r.status === "Awaiting approval").length,
    },
    meetingActions: {
      open: meetingActions.length,
      overdue: meetingActions.filter(({ action }) => action.due && action.due < today).length,
    },
    requestsSubmitted: requestRows.filter((r) => r.data?.status === "Submitted").length,
    chart,
    attention,
    openRcas,
    activity,
  };
}

/** Count of submitted document requests, for the sidebar badge on pages that don't load everything. */
export async function loadSubmittedRequestCount(): Promise<number> {
  const rows = await selectAll(tables.documentRequests, "created", false);
  return rows.filter((r) => r.data?.status === "Submitted").length;
}
