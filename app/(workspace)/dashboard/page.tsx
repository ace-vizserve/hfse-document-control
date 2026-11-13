import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardCheck, FileCheck2, FilePlus2, History, ShieldCheck, TriangleAlert } from "lucide-react";
import { access } from "../../access";
import RestrictedPanel from "../_shell/RestrictedPanel";
import ActivityChart from "./ActivityChart";
import { loadDashboard, type DashboardData } from "./data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

const RCA_STATUS_VARIANT = {
  Open: "outline",
  "In progress": "default",
  "Awaiting approval": "secondary",
  Closed: "outline",
} as const;

function initialsOf(email: string) {
  const parts = email.split("@")[0].split(/[._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function StatCard({ label, value, hint, icon, warn }: { label: string; value: number; hint: ReactNode; icon: ReactNode; warn?: boolean }) {
  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex flex-row items-center justify-between px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className={`flex size-8 items-center justify-center rounded-lg [&_svg]:size-4 ${warn ? "bg-brand-orange/10 text-brand-orange" : "bg-accent text-primary"}`}>
          {icon}
        </span>
      </CardHeader>
      <CardContent className="px-5">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function Overview({ data }: { data: DashboardData }) {
  const { documents, reviews, rca, meetingActions } = data;
  return (
    <>
      {data.requestsSubmitted > 0 && (
        <Alert className="border-brand-orange/30 bg-brand-orange/5">
          <FilePlus2 className="text-brand-orange" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-foreground">
            <span>
              <span className="font-semibold">{data.requestsSubmitted}</span> document request{data.requestsSubmitted === 1 ? " is" : "s are"} waiting for HRPC review.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/requests">
                Review requests <ArrowRight />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approved documents"
          value={documents.approved}
          icon={<FileCheck2 />}
          hint={`${documents.inReview} in review · ${documents.draft} draft`}
        />
        <StatCard
          label="Reviews due"
          value={reviews.overdue + reviews.next30}
          icon={<ShieldCheck />}
          warn={reviews.overdue > 0}
          hint={reviews.overdue > 0 ? <span className="font-medium text-brand-orange">{reviews.overdue} overdue · {reviews.next30} in next 30 days</span> : `${reviews.next30} in the next 30 days`}
        />
        <StatCard
          label="Open RCA cases"
          value={rca.open}
          icon={<ClipboardCheck />}
          warn={rca.overdue > 0}
          hint={rca.overdue > 0 ? <span className="font-medium text-brand-orange">{rca.overdue} overdue · {rca.awaitingApproval} awaiting approval</span> : `${rca.awaitingApproval} awaiting approval`}
        />
        <StatCard
          label="Open meeting actions"
          value={meetingActions.open}
          icon={<CalendarCheck />}
          warn={meetingActions.overdue > 0}
          hint={meetingActions.overdue > 0 ? <span className="font-medium text-brand-orange">{meetingActions.overdue} overdue</span> : "None overdue"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Register activity</CardTitle>
            <CardDescription>Document changes and approvals per week, last eight weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={data.chart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Overdue or due soon across reviews, RCA and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {data.attention.length === 0 ? (
              <Empty>Nothing overdue or due in the next two weeks.</Empty>
            ) : (
              <ul className="flex flex-col divide-y">
                {data.attention.map((item, i) => (
                  <li key={`${item.kind}-${i}`}>
                    <Link href={item.href} className="group flex items-start gap-3 py-2.5 first:pt-0">
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${item.overdue ? "bg-brand-orange" : "bg-primary/40"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium group-hover:text-primary">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.kind} · {item.detail}
                        </span>
                      </span>
                      <span className={`shrink-0 text-xs tabular-nums ${item.overdue ? "font-semibold text-brand-orange" : "text-muted-foreground"}`}>
                        {item.overdue ? "Overdue · " : ""}
                        {item.dueLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open RCA cases</CardTitle>
            <CardDescription>Corrective actions completed, soonest due first</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/rca">
                  View all <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {data.openRcas.length === 0 ? (
              <Empty>No open RCA cases.</Empty>
            ) : (
              data.openRcas.map((r) => (
                <div key={r.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">
                      <span className="text-muted-foreground">{r.code}</span> · {r.title}
                    </div>
                    <Badge variant={RCA_STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={r.progress} aria-label={`${r.title} actions completed`} />
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {r.actionsDone}/{r.actionsTotal} actions
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">
                      {r.assignee} · {r.department}
                    </span>
                    <span className={r.overdue ? "shrink-0 font-semibold text-brand-orange" : "shrink-0"}>
                      {r.overdue ? "Overdue · " : "Due "}
                      {r.dueLabel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest changes to the document register</CardDescription>
            <CardAction>
              <span className="text-muted-foreground [&_svg]:size-4">
                <History />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            {data.activity.length === 0 ? (
              <Empty>No register activity yet.</Empty>
            ) : (
              <ol className="flex flex-col gap-4">
                {data.activity.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">{initialsOf(entry.actor)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm leading-snug">
                        <span className="font-medium">{entry.actor.split("@")[0]}</span>{" "}
                        <span className="text-muted-foreground">{entry.action.toLowerCase()}</span>{" "}
                        <span className="font-medium">{entry.title}</span>
                        {entry.code && <span className="text-muted-foreground"> ({entry.code})</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{entry.when}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const { canControl } = await access();
  if (!canControl) return <RestrictedPanel message="The admin dashboard is available only to authorised Document Control administrators." />;

  let data: DashboardData | null = null;
  try {
    data = await loadDashboard();
  } catch {
    data = null;
  }

  return data ? (
    <Overview data={data} />
  ) : (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertDescription>Unable to load dashboard data. Refresh the page to try again.</AlertDescription>
    </Alert>
  );
}
