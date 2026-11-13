import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, Lock, LogOut, ShieldCheck, TriangleAlert } from "lucide-react";
import HomeTabs from "./HomeTabs";
import { access } from "./access";
import { chalkFont } from "./fonts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";


function MicrosoftLogo() {
  return (
    <span aria-hidden className="grid grid-cols-2 gap-[2px]">
      <span className="size-[7px] bg-[#f25022]" />
      <span className="size-[7px] bg-[#7fba00]" />
      <span className="size-[7px] bg-[#00a4ef]" />
      <span className="size-[7px] bg-[#ffb900]" />
    </span>
  );
}

/** A yellow HB pencil, drawn lying on its side. */
function Pencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="pencil-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd76a" />
          <stop offset="0.5" stopColor="#f4b400" />
          <stop offset="1" stopColor="#c98d00" />
        </linearGradient>
        <linearGradient id="pencil-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e8ec" />
          <stop offset="0.5" stopColor="#b9bec7" />
          <stop offset="1" stopColor="#8d939d" />
        </linearGradient>
      </defs>
      <rect x="0" y="3" width="24" height="18" rx="5" fill="#f08a9c" />
      <rect x="20" y="2" width="18" height="20" fill="url(#pencil-metal)" />
      <line x1="26" y1="2" x2="26" y2="22" stroke="#7d838d" strokeWidth="1" />
      <line x1="32" y1="2" x2="32" y2="22" stroke="#7d838d" strokeWidth="1" />
      <rect x="38" y="3" width="160" height="18" fill="url(#pencil-body)" />
      <line x1="38" y1="9" x2="198" y2="9" stroke="#d9a000" strokeWidth="1" />
      <line x1="38" y1="15" x2="198" y2="15" stroke="#b78300" strokeWidth="1" />
      <text x="62" y="14.5" fontSize="7" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="1.5" fill="#6b4d00">
        HFSE · HB
      </text>
      <polygon points="198,3 232,12 198,21" fill="#efcf9f" />
      <polygon points="223,9.4 232,12 223,14.6" fill="#2b2b2b" />
    </svg>
  );
}

function ChalkStick({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`block h-2.5 rounded-full shadow-[0_2px_2px_rgba(0,0,0,0.35)] ${className ?? ""}`}
      style={{ background: `linear-gradient(180deg, #fff, ${color})` }}
    />
  );
}

function Eraser({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`block w-20 overflow-hidden rounded-[3px] shadow-[0_3px_3px_rgba(0,0,0,0.4)] ${className ?? ""}`}>
      <span className="block h-3.5 bg-gradient-to-b from-[#c48a52] to-[#9c6634]" />
      <span className="block h-2 bg-gradient-to-b from-[#4a4a4a] to-[#2c2c2c]" />
    </span>
  );
}

type Workspace = { icon: ReactNode; title: string; description: string; href: string; allowed: boolean };

function WorkspaceRow({ icon, title, description, href, allowed }: Workspace) {
  const inner = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/45 text-white/85 [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`${chalkFont.className} chalk block text-xl leading-tight text-white`}>{title}</span>
        <span className="block truncate text-xs text-white/55">{description}</span>
      </span>
      {allowed ? (
        <ArrowRight className="size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[#ffd27a]" />
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/30 px-2 py-0.5 text-[10px] text-white/55">
          <Lock className="size-3" /> Restricted
        </span>
      )}
    </>
  );
  const cls = "group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors";
  return allowed ? (
    <a href={href} className={`${cls} hover:bg-white/[0.06]`}>
      {inner}
    </a>
  ) : (
    <div className={cls} title="Access restricted. Contact HRPC for authorisation.">
      {inner}
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ auth_error?: string }> }) {
  const { user, canControl } = await access();
  // Administrators work from the dashboard; this page is the sign-in and staff entry point.
  if (canControl) redirect("/dashboard");
  const { auth_error } = await searchParams;

  const workspaces: Workspace[] = [
    { icon: <BookOpen />, title: "Staff Document Library", description: "Approved, effective policies, procedures and forms", href: "/library", allowed: canControl },
    { icon: <ShieldCheck />, title: "Document Control", description: "Register, revisions and approval decisions", href: "/control", allowed: canControl },
    { icon: <ClipboardCheck />, title: "Root Cause Analysis", description: "RCA requests, assignments and action-plan closure", href: "/rca", allowed: canControl },
    { icon: <CalendarCheck />, title: "Minutes of the Meeting", description: "Decisions, action owners, due dates and closure", href: "/meetings", allowed: true },
  ];

  const initials = user?.email?.slice(0, 2).toUpperCase();

  return (
    <div className="grid min-h-svh bg-desk font-sans text-foreground lg:h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Chalkboard in a wooden frame */}
      <div className="bg-wood flex flex-col p-3 pb-0 lg:p-4 lg:pb-0">
        <div className="bg-chalkboard relative flex flex-1 flex-col overflow-hidden rounded-[4px] p-6 pb-10 text-white lg:p-9 lg:pb-12">
          <div className="relative flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue text-base font-bold text-white shadow-[3px_3px_0_var(--color-brand-orange)]">H</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">HFSE</div>
              <div className="text-[10px] tracking-[0.18em] text-white/60 uppercase">Document Control Centre</div>
            </div>
          </div>

          {/* "A+" chalk doodle */}
          <div aria-hidden className={`${chalkFont.className} chalk absolute top-6 right-8 hidden rotate-[-8deg] text-[#ffd27a] sm:block`}>
            <svg viewBox="0 0 90 70" className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]" fill="none">
              <path d="M10 38 C 8 14, 70 6, 80 30 C 88 52, 40 66, 18 56 C 6 50, 8 40, 14 34" stroke="#ffd27a" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            </svg>
            <span className="relative px-3 text-4xl font-bold">A+</span>
          </div>

          <div className="relative my-8 lg:my-auto">
            <div className={`${chalkFont.className} chalk text-xl text-white/70`}>Today’s lesson: one source of truth</div>
            <div className={`${chalkFont.className} chalk mt-1 text-5xl leading-[1.05] font-bold lg:text-6xl`}>
              The right document.
              <br />
              <span className="relative inline-block text-[#ffd27a]">
                Every time.
                <svg aria-hidden viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full" fill="none">
                  <path d="M3 10 C 60 3, 110 14, 160 7 S 260 4, 297 9" stroke="#ed7622" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
                </svg>
              </span>
            </div>
            <div className="mt-5 max-w-md text-sm text-white/70">
              Find approved policies, procedures and forms. Keep every revision clear and accountable.
            </div>

            <div className="mt-7 max-w-lg">
              <div className={`${chalkFont.className} chalk mb-1 px-3 text-lg text-white/60 underline decoration-white/30 decoration-dashed underline-offset-4`}>
                Workspaces
              </div>
              <div className="space-y-0.5">
                {workspaces.map((w) => (
                  <WorkspaceRow key={w.title} {...w} />
                ))}
              </div>
            </div>
          </div>

          <div className="relative hidden text-[11px] text-white/35 lg:block">
            HFSE International School · Office of Human Resources, Policies &amp; Compliance
          </div>
        </div>

        {/* Chalk tray with chalk, eraser and pencil */}
        <div className="relative -mx-3 h-5 bg-gradient-to-b from-[#a8743f] to-[#5e3a18] shadow-[0_4px_8px_rgba(0,0,0,0.35)] lg:-mx-4">
          <div className="absolute right-6 bottom-[14px] flex items-end gap-3 lg:right-10">
            <ChalkStick color="#e9e9e9" className="w-12" />
            <ChalkStick color="#ffe9a6" className="w-8" />
            <ChalkStick color="#ffc4d2" className="w-10" />
            <Eraser />
            <Pencil className="h-5 w-48 -rotate-3" />
          </div>
        </div>
      </div>

      {/* Desk side with the sign-in sheet */}
      <div className="flex flex-col lg:overflow-y-auto">
        <div className="flex flex-1 flex-col justify-center p-6 lg:p-10">
          <HomeTabs canRequest={canControl}>
            <div className="relative mx-auto w-full max-w-sm rounded-md border bg-card p-6 shadow-[0_10px_30px_rgba(33,35,70,0.08)]">
              {/* Tape */}
              <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[2px] bg-[#ffe9a6]/70 shadow-sm" />
              {user ? (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className={`${chalkFont.className} text-3xl font-bold text-brand-navy`}>Welcome back!</div>
                    <div className="text-sm text-muted-foreground">Choose a workspace to continue.</div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{initials}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">Signed in as</div>
                      <div className="truncate text-sm font-medium">{user.email}</div>
                    </div>
                    <form action="/auth/signout" method="post">
                      <Button variant="ghost" size="icon-sm" aria-label="Sign out" title="Sign out">
                        <LogOut />
                      </Button>
                    </form>
                  </div>
                  <div className="grid gap-2">
                    {workspaces
                      .filter((w) => w.allowed)
                      .map((w) => (
                        <Button key={w.title} asChild variant="outline" className="h-10 justify-between">
                          <a href={w.href}>
                            <span className="flex items-center gap-2">
                              {w.icon}
                              {w.title}
                            </span>
                            <ArrowRight className="text-muted-foreground" />
                          </a>
                        </Button>
                      ))}
                  </div>
                  {!canControl && (
                    <div className="text-xs text-muted-foreground">
                      Staff library access is not yet enabled. Contact HRPC if you need Document Control or RCA access.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className={`${chalkFont.className} text-4xl font-bold text-brand-navy`}>Sign in</div>
                    <div className="text-sm text-muted-foreground">Use your HFSE Microsoft work account or your HFSE email.</div>
                  </div>

                  {auth_error && (
                    <Alert variant="destructive">
                      <TriangleAlert />
                      <AlertDescription>Sign-in did not complete. Please try again.</AlertDescription>
                    </Alert>
                  )}

                  <Button asChild variant="outline" className="h-10 w-full">
                    <a href="/auth/login">
                      <MicrosoftLogo /> Continue with Microsoft
                    </a>
                  </Button>

                  <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-x-0 after:top-1/2 after:border-t">
                    <span className="relative z-10 bg-card px-2">or continue with email</span>
                  </div>

                  <form action="/auth/login" method="post" className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" name="email" autoComplete="username" placeholder="name@hfse.edu.sg" required className="h-10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" name="password" autoComplete="current-password" required className="h-10" />
                    </div>
                    <Button type="submit" className="h-10 w-full">
                      Sign in
                    </Button>
                  </form>

                  <div className="text-center text-xs text-muted-foreground">
                    Staff library access is not yet enabled. Document Control is secured by server-side administrator checks.
                  </div>
                </div>
              )}
            </div>
          </HomeTabs>
        </div>
        <div className="p-4 text-center text-[11px] text-muted-foreground lg:hidden">
          HFSE International School · Office of Human Resources, Policies &amp; Compliance
        </div>
      </div>
    </div>
  );
}
