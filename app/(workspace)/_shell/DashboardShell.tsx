"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CalendarCheck, ClipboardCheck, FilePlus2, Home, LayoutDashboard, LogOut, Search, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export type ShellUser = { email: string; name: string; initials: string };

type NavItem = { label: string; href: string; icon: typeof Home; adminOnly: boolean; badge?: boolean };

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, adminOnly: true },
  { label: "Document Control", href: "/control", icon: ShieldCheck, adminOnly: true },
  { label: "Staff Library", href: "/library", icon: BookOpen, adminOnly: true },
  { label: "RCA Monitoring", href: "/rca", icon: ClipboardCheck, adminOnly: true },
  { label: "Meeting Minutes", href: "/meetings", icon: CalendarCheck, adminOnly: false },
  { label: "Document Requests", href: "/dashboard/requests", icon: FilePlus2, adminOnly: true, badge: true },
];

/** Exact match for the overview and home links; prefix match for the module pages. */
function isActive(href: string, pathname: string) {
  return href === "/dashboard" || href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar and top bar shared by every signed-in workspace page.
 * It is rendered by app/(workspace)/layout.tsx, so it stays mounted while pages change.
 */
export default function DashboardShell({
  user,
  requestCount,
  admin,
  children,
}: {
  user: ShellUser;
  requestCount: number;
  /** Staff who are not administrators only see the pages they can use. */
  admin: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const nav = admin ? NAV : [{ label: "Home", href: "/", icon: Home, adminOnly: false }, ...NAV.filter((item) => !item.adminOnly)];
  const homeHref = admin ? "/dashboard" : "/";
  const current = NAV.find((item) => isActive(item.href, pathname));
  const title = pathname === "/dashboard" ? `Welcome back, ${user.name.split(" ")[0]}` : (current?.label ?? "HFSE Document Control");

  return (
    <SidebarProvider className="font-sans text-foreground">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="HFSE Document Control">
                <Link href={homeHref}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand-navy shadow-[2px_2px_0_var(--color-brand-orange)]">
                    H
                  </span>
                  <span className="grid leading-tight">
                    <span className="text-sm font-semibold text-white">HFSE</span>
                    <span className="text-[10px] tracking-wider text-sidebar-foreground/70 uppercase">Document Control</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60">{admin ? "Admin workspace" : "Workspace"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href, pathname)}
                      tooltip={item.label}
                      className="transition-colors duration-200 data-[active=true]:shadow-[inset_3px_0_0_var(--color-brand-orange)]"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && requestCount > 0 && (
                      <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground">{requestCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <form action="/auth/signout" method="post">
                <SidebarMenuButton type="submit" tooltip="Sign out" className="h-auto py-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-white">{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-xs font-medium text-white">{user.name}</span>
                    <span className="truncate text-[10px] text-sidebar-foreground/70">{user.email}</span>
                  </span>
                  <LogOut className="ml-auto" />
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ml-0 / min-w-0 override the old global `main` rule (fixed left margin for the legacy sidebar). */}
      <SidebarInset className="ml-0 min-w-0 bg-background">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div key={title} className="truncate text-lg font-semibold animate-in fade-in-0 duration-300">
            {title}
          </div>
          <div className="ml-auto flex items-center gap-1">
            {admin && (
              <>
                <Button variant="ghost" size="icon" asChild aria-label="Search the register" title="Search the register">
                  <Link href="/control">
                    <Search />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild aria-label="Document requests" title="Document requests" className="relative">
                  <Link href="/dashboard/requests">
                    <Bell />
                    {requestCount > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-orange" />}
                  </Link>
                </Button>
              </>
            )}
            <Avatar className="ml-1 size-8">
              <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{user.initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        {/* Keyed by path so each page fades in; the sidebar and top bar above stay put. */}
        <div key={pathname} className="flex flex-1 flex-col gap-6 p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out sm:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
